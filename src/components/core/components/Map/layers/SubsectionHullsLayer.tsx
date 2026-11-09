import { feature, featureCollection } from "@turf/helpers"
import type { Feature, FeatureCollection, LineString, MultiPolygon, Polygon } from "geojson"
import type { ExpressionSpecification, FilterSpecification } from "maplibre-gl"
import { Layer, Source } from "react-map-gl/maplibre"
import { subsectionColors } from "@/src/components/core/components/Map/colors/subsectionColors"
import type { LineProperties, PolygonProperties } from "../utils/getSubsectionFeatures"
import { lineToHullGeometry } from "../utils/lineToHullGeometry"

const baseSubsectionHullLayerId = "layer_subsection_hull_features"

const getSubsectionHullLayerId = (suffix: string) => `${baseSubsectionHullLayerId}${suffix}`

/** Layer id for the "other" (non-current) subsection hull fill; use in interactiveLayerIds for hover/click. */
export const getSubsectionHullOtherFillLayerId = (suffix: string) =>
  `${getSubsectionHullLayerId(suffix)}-fill-other`

export type SubsectionHullsLayerProps = {
  lines: FeatureCollection<LineString, LineProperties> | undefined
  polygons: FeatureCollection<Polygon, PolygonProperties> | undefined
  layerIdSuffix: string
  fadedOthers?: boolean
}

export const SubsectionHullsLayer = ({
  lines,
  polygons,
  layerIdSuffix,
  fadedOthers = false,
}: SubsectionHullsLayerProps) => {
  const hullFeatures: Array<Feature<Polygon | MultiPolygon, LineProperties | PolygonProperties>> =
    []

  if (lines && lines.features.length > 0) {
    for (const lineFeature of lines.features) {
      if (!lineFeature.properties.subsectionSlug) continue

      try {
        const hullGeometry = lineToHullGeometry(lineFeature.geometry)
        const hullFeature = feature(
          hullGeometry,
          { ...lineFeature.properties, isLineHull: true },
          { id: `hull-${lineFeature.properties.featureId}` },
        )
        hullFeatures.push(hullFeature)
      } catch (error) {
        console.error("Failed to convert line to hull:", error)
      }
    }
  }

  if (polygons && polygons.features.length > 0) {
    for (const polygonFeature of polygons.features) {
      if (!polygonFeature.geometry) continue
      if (!polygonFeature.properties.subsectionSlug) continue

      hullFeatures.push(polygonFeature)
    }
  }

  if (hullFeatures.length === 0) return null

  const allFeatures = featureCollection(hullFeatures)
  const sourceId = getSubsectionHullLayerId(layerIdSuffix)
  const layerId = getSubsectionHullLayerId(layerIdSuffix)

  const filterCurrent: FilterSpecification = ["==", ["get", "isCurrent"], true]
  const filterOther: FilterSpecification = ["==", ["get", "isCurrent"], false]

  const isOtherHovered: ExpressionSpecification = [
    "==",
    ["get", "subsectionSlug"],
    ["coalesce", ["global-state", "highlightSubsectionSlug"], ""],
  ]

  const colorOtherExpression: ExpressionSpecification = [
    "case",
    isOtherHovered,
    subsectionColors.hull.hovered,
    subsectionColors.hull.unselected,
  ]

  const isLineHull: ExpressionSpecification = ["boolean", ["get", "isLineHull"], false]
  const otherOpacity = (
    opacity: number,
    fadedLineHull: number,
    fadedArea: number,
  ): number | ExpressionSpecification =>
    fadedOthers ? ["case", isOtherHovered, opacity, isLineHull, fadedLineHull, fadedArea] : opacity

  return (
    <Source id={sourceId} key={sourceId} type="geojson" data={allFeatures} promoteId="featureId">
      {/* Other subsections first (below); gray, yellow on hover, interactive */}
      <Layer
        id={`${layerId}-fill-other`}
        type="fill"
        filter={filterOther}
        paint={{
          "fill-color": colorOtherExpression,
          "fill-opacity": otherOpacity(0.28, 0.25, 0.08),
        }}
      />
      <Layer
        id={`${layerId}-outline-other`}
        type="line"
        filter={filterOther}
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": fadedOthers ? ["case", isLineHull, 1.5, 1] : 1,
          "line-color": colorOtherExpression,
          "line-opacity": otherOpacity(0.7, 0.75, 0.35),
        }}
      />
      {/* Current subsection on top: always blue, non-transparent line, not interactive */}
      <Layer
        id={`${layerId}-fill-current`}
        type="fill"
        filter={filterCurrent}
        paint={{
          "fill-color": subsectionColors.hull.current,
          "fill-opacity": 0.05,
        }}
      />
      <Layer
        id={`${layerId}-outline-current`}
        type="line"
        filter={filterCurrent}
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 1,
          "line-color": subsectionColors.hull.current,
          "line-opacity": 1,
        }}
      />
    </Source>
  )
}
