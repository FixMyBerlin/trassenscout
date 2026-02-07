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
import { getLineLayerId } from "./layers/LinesLayer"
import { getPointLayerId } from "./layers/PointsLayer"
import { getPolygonLayerId } from "./layers/PolygonsLayer"
import { SubsectionHullsLayer } from "./layers/SubsectionHullsLayer"
import { MapLegend } from "./MapLegend"
import { SubsubsectionMarkers } from "./markers/SubsubsectionMarkers"
import { subsectionLegendConfig } from "./SubsectionSubsubsectionMap.legendConfig"
import { UploadMarkers } from "./UploadMarkers"
import { geometriesBbox } from "./utils/bboxHelpers"
import { getSubsectionFeatures } from "./utils/getSubsectionFeatures"
import { getSubsubsectionFeatures } from "./utils/getSubsubsectionFeatures"

type Props = {
  subsections: TGetSubsection[]
  selectedSubsection: TGetSubsection
  subsubsections: SubsubsectionWithPosition[]
}

export const SubsectionSubsubsectionMap = ({
  subsections,
  selectedSubsection,
  subsubsections,
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

  const handleClickMap = (e: MapLayerMouseEvent) => {
    const subsectionSlug = e.features?.at(0)?.properties?.subsectionSlug
    const subsubsectionSlug = e.features?.at(0)?.properties?.subsubsectionSlug

    // Handle subsection click (when subsectionSlug exists but no subsubsectionSlug)
    if (subsectionSlug && !subsubsectionSlug) {
      // Skip if clicking the selected subsection
      if (subsectionSlug === selectedSubsection.slug) return

      handleSelect({ subsectionSlug, edit: e.originalEvent?.altKey })
      return
    }

    // Handle subsubsection click
    if (subsectionSlug && subsubsectionSlug) {
      handleSelect({ subsectionSlug, subsubsectionSlug, edit: e.originalEvent?.altKey })

      // Fly to bounds of clicked subsubsection
      const map = e.target
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

  const {
    lines: subsectionLines,
    polygons: subsectionPolygons,
    lineEndPoints: subsectionLineEndPointsGeoms,
  } = useMemo(
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
    lineEndPoints: subsubsectionLineEndPointsGeoms,
  } = useMemo(
    () =>
      getSubsubsectionFeatures({
        subsubsections: filteredSubsubsections,
        selectedSubsubsectionSlug: pageSubsubsectionSlug,
      }),
    [filteredSubsubsections, pageSubsubsectionSlug],
  )

  // Only include subsubsection lines (subsection lines are shown as hulls via SubsectionHullsLayer)
  const allLines = subsubsectionLines?.features.length ? subsubsectionLines : undefined

  // Only include subsubsection polygons (subsection polygons are shown as hulls via SubsectionHullsLayer for LINE, or not shown for POLYGON)
  const allPolygons = subsubsectionPolygons?.features.length ? subsubsectionPolygons : undefined

  // Only include subsubsection line endpoints (subsection endpoints are not shown)
  const allLineEndPointsGeoms = subsubsectionLineEndPointsGeoms?.features.length
    ? subsubsectionLineEndPointsGeoms
    : undefined

  // Set selected state via setFeatureState when selection changes
  useEffect(() => {
    if (!mainMap) return

    const map = mainMap.getMap()
    const suffix = "_subsubsection"

    // Reset all selected states first
    // All features in BaseMap are subsubsections (subsection features are handled by hulls)
    if (allLines) {
      allLines.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState(
            { source: getLineLayerId(suffix), id: featureId },
            { selected: false },
          )
        }
      })
    }
    if (subsubsectionPoints) {
      subsubsectionPoints.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState(
            { source: getPointLayerId(suffix), id: featureId },
            { selected: false },
          )
        }
      })
    }
    if (allPolygons) {
      allPolygons.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState(
            { source: getPolygonLayerId(suffix), id: featureId },
            { selected: false },
          )
        }
      })
    }
    if (allLineEndPointsGeoms) {
      allLineEndPointsGeoms.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState(
            { source: getLineEndPointsLayerId(suffix), id: featureId },
            { selected: false },
          )
        }
      })
    }

    // Set selected state for current selection
    if (pageSubsubsectionSlug) {
      // Find and set selected subsubsection
      const selectedSubsubsection = filteredSubsubsections.find(
        (subsub) => subsub.slug === pageSubsubsectionSlug,
      )
      if (selectedSubsubsection) {
        const geometryType = selectedSubsubsection.type
        const sourceId =
          geometryType === "LINE"
            ? getLineLayerId(suffix)
            : geometryType === "POINT"
              ? getPointLayerId(suffix)
              : getPolygonLayerId(suffix)

        // Find features matching this subsubsection
        const featuresToSelect =
          geometryType === "LINE"
            ? allLines?.features.filter(
                (f) => (f.properties as any)?.subsubsectionSlug === pageSubsubsectionSlug,
              ) || []
            : geometryType === "POINT"
              ? subsubsectionPoints?.features.filter(
                  (f) => f.properties?.subsubsectionSlug === pageSubsubsectionSlug,
                ) || []
              : allPolygons?.features.filter(
                  (f) => (f.properties as any)?.subsubsectionSlug === pageSubsubsectionSlug,
                ) || []

        featuresToSelect.forEach((f) => {
          const featureId = f.properties?.featureId
          if (featureId) {
            map.setFeatureState({ source: sourceId, id: featureId }, { selected: true })
          }
        })

        // Also set selected state on matching line endpoints if it's a LINE
        if (selectedSubsubsection.type === "LINE") {
          const endPointsSourceId = getLineEndPointsLayerId(suffix)
          const matchingEndPoints =
            allLineEndPointsGeoms?.features.filter(
              (endPoint) => endPoint.properties?.lineId === pageSubsubsectionSlug,
            ) || []

          matchingEndPoints.forEach((endPoint) => {
            const featureId = endPoint.properties?.featureId
            if (featureId) {
              map.setFeatureState({ source: endPointsSourceId, id: featureId }, { selected: true })
            }
          })
        }
      }
    }
  }, [
    mainMap,
    pageSubsubsectionSlug,
    filteredSubsubsections,
    allLines,
    subsubsectionPoints,
    allPolygons,
    allLineEndPointsGeoms,
  ])

  return (
    <>
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: mapBbox,
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClickMap}
        lines={allLines}
        polygons={allPolygons}
        points={subsubsectionPoints}
        lineEndPoints={allLineEndPointsGeoms}
        selectableLayerIdSuffix="_subsubsection"
        colorSchema="subsubsection"
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
