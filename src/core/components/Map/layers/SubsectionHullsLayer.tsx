import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { feature, featureCollection } from "@turf/helpers"
import type { Feature, FeatureCollection, LineString, MultiPolygon, Polygon } from "geojson"
import { ExpressionSpecification } from "maplibre-gl"
import { Layer, Source } from "react-map-gl/maplibre"
import type { LineProperties, PolygonProperties } from "../utils/getSubsectionFeatures"
import { lineToHullGeometry } from "../utils/lineToHullGeometry"

const baseSubsectionHullLayerId = "layer_subsection_hull_features"

export const getSubsectionHullLayerId = (suffix: string) => `${baseSubsectionHullLayerId}${suffix}`

export type SubsectionHullsLayerProps = {
  lines: FeatureCollection<LineString, LineProperties> | undefined
  polygons: FeatureCollection<Polygon, PolygonProperties> | undefined
  layerIdSuffix: string
}

export const SubsectionHullsLayer = ({
  lines,
  polygons,
  layerIdSuffix,
}: SubsectionHullsLayerProps) => {
  const hullFeatures: Array<Feature<Polygon | MultiPolygon, LineProperties | PolygonProperties>> =
    []

  if (lines && lines.features.length > 0) {
    for (const lineFeature of lines.features) {
      if (!lineFeature.properties.subsectionSlug) continue

      try {
        const hullGeometry = lineToHullGeometry(lineFeature.geometry)
        const hullFeature = feature(hullGeometry, lineFeature.properties, {
          id: `hull-${lineFeature.properties.featureId}`,
        })
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

  const colorExpression: ExpressionSpecification = [
    "case",
    ["get", "isCurrent"],
    subsectionColors.hull.current,
    subsectionColors.hull.unselected,
  ]

  return (
    <Source id={sourceId} key={sourceId} type="geojson" data={allFeatures}>
      <Layer
        id={`${layerId}-fill`}
        type="fill"
        paint={{
          "fill-color": colorExpression,
          "fill-opacity": 0.05,
        }}
      />
      <Layer
        id={`${layerId}-outline`}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 1,
          "line-color": colorExpression,
          "line-opacity": 0.7,
        }}
      />
    </Source>
  )
}
