import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson"
import type { MapLayerMouseEvent } from "maplibre-gl"
import { useMemo, useRef, useState } from "react"
import { geometryAnchorPoint } from "@/src/components/core/components/Map/utils/geometryAnchorPoint"
import type { AcquisitionAreaWithTypedGeometry } from "@/src/server/acquisitionAreas/types"
import type { SupportedGeometry } from "@/src/shared/geometry/geometrySchemas"

/**
 * Source ids live here rather than in the map component: the `hover` feature state is keyed by
 * (source, featureId), so whatever sets that state and whatever renders the `<Source>` have to
 * agree on the id. Keeping them next to the hover logic makes that agreement checkable.
 */
export const ACQUISITION_AREA_PARCEL_SOURCE_ID = "acquisition-area-parcels"
export const ACQUISITION_AREA_UNSELECTED_SOURCE_ID = "acquisition-area-unselected"
export const ACQUISITION_AREA_SELECTED_SOURCE_ID = "acquisition-area-selected"

type HoverFeatureTarget = {
  source: string
  id: string
}

/** Stable empty value so `applyHoverFeatureState` can compare target lists by identity. */
const NO_HOVER_TARGETS: HoverFeatureTarget[] = []

type MapTooltip = {
  longitude: number
  latitude: number
  content: string
}

type AcquisitionAreaFeatureCollection = FeatureCollection<Geometry, GeoJsonProperties>

type Props = {
  acquisitionAreas: AcquisitionAreaWithTypedGeometry[]
  parcelFeatures: AcquisitionAreaFeatureCollection
  selectedFeatures: AcquisitionAreaFeatureCollection
  unselectedFeatures: AcquisitionAreaFeatureCollection
}

/**
 * Hover behaviour for the Grunderwerb map: tints a Verhandlungsfläche and its Grundfläche
 * together, and shows a tooltip for whichever of the two is under the cursor.
 *
 * A Verhandlungsfläche and its parcel live in different sources, and selecting one moves it
 * between the selected/unselected sources — so the hover state is tracked as a list of
 * (source, featureId) targets per acquisition area rather than as a single feature.
 */
export function useAcquisitionAreaMapHover({
  acquisitionAreas,
  parcelFeatures,
  selectedFeatures,
  unselectedFeatures,
}: Props) {
  const hoveredFeatureTargetsRef = useRef<HoverFeatureTarget[]>(NO_HOVER_TARGETS)
  const [tooltip, setTooltip] = useState<MapTooltip | null>(null)

  const hoverTargetsByAcquisitionAreaId = useMemo(() => {
    const targets = new Map<number, HoverFeatureTarget[]>()
    const addTargets = (source: string, collection: AcquisitionAreaFeatureCollection) => {
      for (const item of collection.features) {
        const id = Number(item.properties?.acquisitionAreaId)
        if (!Number.isFinite(id)) continue
        const current = targets.get(id) ?? []
        current.push({ source, id: String(item.properties?.featureId) })
        targets.set(id, current)
      }
    }

    addTargets(ACQUISITION_AREA_SELECTED_SOURCE_ID, selectedFeatures)
    addTargets(ACQUISITION_AREA_UNSELECTED_SOURCE_ID, unselectedFeatures)
    addTargets(ACQUISITION_AREA_PARCEL_SOURCE_ID, parcelFeatures)

    return targets
  }, [parcelFeatures, selectedFeatures, unselectedFeatures])

  // Anchored to a point on the geometry rather than to the cursor, so the bubble keeps pointing at
  // the same place while the map pans or flies to the clicked area. Memoizing them also means
  // re-setting the same tooltip during a mousemove burst is a no-op for React.
  const tooltipsByAcquisitionAreaId = useMemo(() => {
    const tooltips = new Map<number, { area?: MapTooltip; parcel?: MapTooltip }>()
    const tooltipAt = (geometry: SupportedGeometry, content: string) => {
      const anchor = geometryAnchorPoint(geometry)
      return anchor ? { ...anchor, content } : undefined
    }

    for (const acquisitionArea of acquisitionAreas) {
      tooltips.set(acquisitionArea.id, {
        area: tooltipAt(acquisitionArea.geometry as SupportedGeometry, String(acquisitionArea.id)),
        // "Flurstücknr." matches how this value is labelled everywhere else in the UI —
        // the Verhandlungsflächen dropdown, EditUploadForm and ProjectRecordFormFields.
        parcel: tooltipAt(
          acquisitionArea.parcel.geometry as SupportedGeometry,
          `Flurstücknr. ${acquisitionArea.parcel.alkisParcelId}`,
        ),
      })
    }
    return tooltips
  }, [acquisitionAreas])

  const applyHoverFeatureState = (
    map: MapLayerMouseEvent["target"],
    hoveredAcquisitionAreaId: number | null,
  ) => {
    const nextTargets =
      hoveredAcquisitionAreaId === null
        ? NO_HOVER_TARGETS
        : (hoverTargetsByAcquisitionAreaId.get(hoveredAcquisitionAreaId) ?? NO_HOVER_TARGETS)

    // Compare the resolved targets, not the acquisition area id: selecting an area moves its
    // feature between the selected/unselected sources, so the same id can need a fresh
    // setFeatureState on a different source.
    if (hoveredFeatureTargetsRef.current === nextTargets) return

    for (const target of hoveredFeatureTargetsRef.current) {
      if (!map.getSource(target.source)) continue
      map.setFeatureState(target, { hover: false })
    }

    for (const target of nextTargets) {
      if (!map.getSource(target.source)) continue
      map.setFeatureState(target, { hover: true })
    }

    hoveredFeatureTargetsRef.current = nextTargets
  }

  /** Every layer in `interactiveLayerIds` carries `acquisitionAreaId`, parcels included. */
  const acquisitionAreaIdForFeature = (
    mapFeature: NonNullable<MapLayerMouseEvent["features"]>[number] | undefined,
  ) => {
    const acquisitionAreaId = Number(mapFeature?.properties?.acquisitionAreaId)
    return Number.isFinite(acquisitionAreaId) ? acquisitionAreaId : null
  }

  const handleMouseMove = (event: MapLayerMouseEvent) => {
    const hoveredFeature = event.features?.at(0)
    const hoveredAcquisitionAreaId = acquisitionAreaIdForFeature(hoveredFeature)
    applyHoverFeatureState(event.target, hoveredAcquisitionAreaId)

    const tooltips =
      hoveredAcquisitionAreaId === null
        ? undefined
        : tooltipsByAcquisitionAreaId.get(hoveredAcquisitionAreaId)
    if (!tooltips) {
      setTooltip(null)
      return
    }

    // The click target layers sit above the parcel layers, so hovering a Verhandlungsfläche shows
    // its id and only the surrounding Grundfläche falls through to the parcel tooltip.
    // A geometry turf could not place an anchor on simply gets no tooltip.
    const hoveredTooltip =
      hoveredFeature?.source === ACQUISITION_AREA_PARCEL_SOURCE_ID ? tooltips.parcel : tooltips.area
    setTooltip(hoveredTooltip ?? null)
  }

  const handleMouseLeave = (event: MapLayerMouseEvent) => {
    applyHoverFeatureState(event.target, null)
    setTooltip(null)
  }

  return { tooltip, acquisitionAreaIdForFeature, handleMouseMove, handleMouseLeave }
}
