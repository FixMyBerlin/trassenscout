import {
  subsectionDashboardRoute,
  subsectionEditRoute,
  subsubsectionDashboardRoute,
  subsubsectionEditRoute,
} from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { MapLayerMouseEvent, useMap } from "react-map-gl/maplibre"
import { BaseMap } from "./BaseMap"
import { getLineEndPointsLayerId } from "./layers/LineEndPointsLayer"
import { SubsectionHullsLayer } from "./layers/SubsectionHullsLayer"
import { getUnifiedLayerId } from "./layers/UnifiedFeaturesLayer"
import { MapLegend } from "./MapLegend"
import { SubsubsectionMarkers } from "./markers/SubsubsectionMarkers"
import type { StaticOverlayConfig } from "./staticOverlay/staticOverlay.types"
import { subsectionLegendConfig } from "./SubsectionSubsubsectionMap.legendConfig"
import { UploadMarkers } from "./UploadMarkers"
import { geometriesBbox } from "./utils/bboxHelpers"
import { getSubsectionFeatures } from "./utils/getSubsectionFeatures"
import { getSubsubsectionFeatures } from "./utils/getSubsubsectionFeatures"
import { mergeFeatureCollections } from "./utils/mergeFeatureCollections"

type Props = {
  subsections: TGetSubsection[]
  selectedSubsection: TGetSubsection
  subsubsections: SubsubsectionWithPosition[]
  staticOverlay?: StaticOverlayConfig
}

export const SubsubsectionMap = ({
  subsections,
  selectedSubsection,
  subsubsections,
  staticOverlay,
}: Props) => {
  const pageSubsectionSlug = useSlug("subsectionSlug")
  const pageSubsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const { mainMap } = useMap()

  // Filter subsubsections to only include entries belonging to the selected subsection
  const filteredSubsubsections = useMemo(
    () => subsubsections.filter((subsub) => subsub.subsectionId === selectedSubsection.id),
    [subsubsections, selectedSubsection.id],
  )

  type HandleSelectProps = {
    subsectionSlug: string
    subsubsectionSlug?: string
    edit: boolean
  }
  const handleSelect = ({ subsectionSlug, subsubsectionSlug, edit }: HandleSelectProps) => {
    if (!projectSlug) return
    const url = edit
      ? subsubsectionSlug
        ? subsubsectionEditRoute(projectSlug, subsectionSlug, subsubsectionSlug)
        : subsectionEditRoute(projectSlug, subsectionSlug)
      : subsubsectionSlug
        ? subsubsectionDashboardRoute(projectSlug, subsectionSlug, subsubsectionSlug)
        : subsectionDashboardRoute(projectSlug, subsectionSlug)

    router.push(url, { scroll: edit })
  }

  const handleClickMap = (event: MapLayerMouseEvent) => {
    const subsectionSlug = event.features?.at(0)?.properties?.subsectionSlug
    const subsubsectionSlug = event.features?.at(0)?.properties?.subsubsectionSlug

    // Handle subsection click (when subsectionSlug exists but no subsubsectionSlug)
    if (subsectionSlug && !subsubsectionSlug) {
      // Skip if clicking the selected subsection
      if (subsectionSlug === selectedSubsection.slug) return

      handleSelect({ subsectionSlug, edit: event.originalEvent?.altKey })
      return
    }

    // Handle subsubsection click
    if (subsectionSlug && subsubsectionSlug) {
      handleSelect({ subsectionSlug, subsubsectionSlug, edit: event.originalEvent?.altKey })

      // Fly to bounds of clicked subsubsection
      const map = event.target
      if (map) {
        const clickedSubsubsection = filteredSubsubsections.find(
          (subsub) => subsub.slug === subsubsectionSlug,
        )
        if (clickedSubsubsection) {
          const bboxResult = geometriesBbox([
            selectedSubsection.geometry,
            clickedSubsubsection.geometry,
          ])

          // Fly to new bounds
          map.fitBounds(bboxResult, {
            padding: 60,
            duration: 1000,
            linear: false, // Use easeInOut animation
          })
        }
      }
    }
  }

  // Calculate bbox including subsection and selected subsubsection if present (for initial view)
  const mapBbox = useMemo(() => {
    const geometries: SupportedGeometry[] = [selectedSubsection.geometry]

    if (pageSubsubsectionSlug) {
      // When a subsubsection is selected: include only the selected one
      const selectedSubsubsection = filteredSubsubsections.find(
        (subsub) => subsub.slug === pageSubsubsectionSlug,
      )
      if (selectedSubsubsection) {
        geometries.push(selectedSubsubsection.geometry)
      }
    } else {
      // When nothing is selected: include all subsubsections
      filteredSubsubsections.forEach((subsub) => {
        geometries.push(subsub.geometry)
      })
    }

    return geometriesBbox(geometries)
  }, [selectedSubsection.geometry, filteredSubsubsections, pageSubsubsectionSlug])

  const { lines: subsectionLines, polygons: subsectionPolygons } = useMemo(
    () =>
      getSubsectionFeatures({
        subsections,
        highlight: "currentSubsection",
        selectedSubsectionSlug: selectedSubsection.slug,
      }),
    [subsections, selectedSubsection.slug],
  )

  const {
    lines: subsubsectionLines,
    points: subsubsectionPoints,
    polygons: subsubsectionPolygons,
    lineEndPoints: subsubsectionLineEndPoints,
  } = useMemo(
    () =>
      getSubsubsectionFeatures({
        subsubsections: filteredSubsubsections,
        selectedSubsubsectionSlug: pageSubsubsectionSlug,
      }),
    [filteredSubsubsections, pageSubsubsectionSlug],
  )

  // Merge lines, polygons, and points into unified features
  const unifiedSubsubsectionFeatures = useMemo(
    () => mergeFeatureCollections(subsubsectionLines, subsubsectionPolygons, subsubsectionPoints),
    [subsubsectionLines, subsubsectionPolygons, subsubsectionPoints],
  )

  // Set selected state via setFeatureState when selection changes
  useEffect(() => {
    if (!mainMap) return

    const map = mainMap.getMap()
    const suffix = "_subsubsection"
    const unifiedSourceId = getUnifiedLayerId(suffix)
    const endPointsSourceId = getLineEndPointsLayerId(suffix)
    const lineEndPointFeatures = subsubsectionLineEndPoints.features

    // Reset all selected states first
    // All features in BaseMap are subsubsections (subsection features are handled by hulls)
    if (unifiedSubsubsectionFeatures) {
      unifiedSubsubsectionFeatures.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState({ source: unifiedSourceId, id: featureId }, { selected: false })
        }
      })
    }
    if (lineEndPointFeatures.length) {
      lineEndPointFeatures.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState({ source: endPointsSourceId, id: featureId }, { selected: false })
        }
      })
    }

    // Set selected state for current selection (subsubsectionSlug uniquely identifies the subsubsection)
    if (pageSubsubsectionSlug && unifiedSubsubsectionFeatures) {
      const slug = pageSubsubsectionSlug

      // Set selected on all unified features matching the slug
      unifiedSubsubsectionFeatures.features.forEach((f) => {
        const props = f.properties as { subsubsectionSlug?: string; featureId?: string } | null
        if (props && props.subsubsectionSlug === slug) {
          const id = props.featureId
          if (id) {
            map.setFeatureState({ source: unifiedSourceId, id }, { selected: true })
          }
        }
      })

      // Set selected on line endpoints for this line
      lineEndPointFeatures
        .filter((ep) => ep.properties?.lineId === slug)
        .forEach((ep) => {
          const id = ep.properties?.featureId
          if (id) {
            map.setFeatureState({ source: endPointsSourceId, id }, { selected: true })
          }
        })
    }
  }, [mainMap, pageSubsubsectionSlug, unifiedSubsubsectionFeatures, subsubsectionLineEndPoints])

  return (
    <>
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: mapBbox,
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClickMap}
        lines={subsubsectionLines?.features.length ? subsubsectionLines : undefined}
        polygons={subsubsectionPolygons?.features.length ? subsubsectionPolygons : undefined}
        points={subsubsectionPoints}
        lineEndPoints={
          subsubsectionLineEndPoints?.features.length ? subsubsectionLineEndPoints : undefined
        }
        selectableLayerIdSuffix="_subsubsection"
        colorSchema="subsubsection"
        staticOverlay={staticOverlay}
      >
        <SubsectionHullsLayer
          lines={subsectionLines}
          polygons={subsectionPolygons}
          layerIdSuffix="_subsubsection"
        />
        <SubsubsectionMarkers
          subsubsections={filteredSubsubsections}
          pageSubsectionSlug={pageSubsectionSlug}
          onSelect={handleSelect}
        />
        <UploadMarkers projectSlug={projectSlug} interactive={true} />
      </BaseMap>
      <MapLegend legendItemsConfig={subsectionLegendConfig} />
      <p className="mt-2 text-right text-xs text-gray-400">
        Schnellzugriff zum Bearbeiten über option+click (Mac) / alt+click (Windows)
      </p>
    </>
  )
}
