import { mapLayerColorConfigs } from "@/src/core/components/Map/colors/mapLayerColorConfigs"
import type { FeatureCollection, Point } from "geojson"
import type { ExpressionSpecification } from "maplibre-gl"
import { Layer, Source } from "react-map-gl/maplibre"

const basePointLayerId = "layer_point_features"

const slugMatchExpression: ExpressionSpecification = [
  "==",
  ["coalesce", ["get", "projectSlug"], ["get", "subsubsectionSlug"], ["get", "subsectionSlug"]],
  ["coalesce", ["global-state", "highlightSlug"], ""],
]

export const getPointLayerId = (suffix: string) => `${basePointLayerId}${suffix}`

export type PointsLayerProps = {
  points:
    | FeatureCollection<
        Point,
        {
          subsectionSlug?: string
          subsubsectionSlug?: string
          style?: "REGULAR" | "DASHED"
          isCurrent?: boolean
          featureId?: string
        }
      >
    | undefined
  layerIdSuffix: string
  interactive: boolean
  colorSchema: "subsection" | "subsubsection"
}

export const PointsLayer = ({
  points,
  layerIdSuffix,
  interactive,
  colorSchema,
}: PointsLayerProps) => {
  if (!points || points.features.length === 0) return null

  const sourceId = getPointLayerId(layerIdSuffix)
  const layerId = getPointLayerId(layerIdSuffix)
  const colors = mapLayerColorConfigs[colorSchema]

  const colorExpression: ExpressionSpecification = [
    "case",
    ["boolean", ["feature-state", "selected"], false],
    colors.point.selected,
    slugMatchExpression,
    colors.point.hovered,
    colors.point.default,
  ]

  const borderColorExpression: ExpressionSpecification = [
    "case",
    slugMatchExpression,
    colors.point.hovered,
    ["boolean", ["feature-state", "selected"], false],
    colors.point.selected,
    colors.point.default,
  ]

  return (
    <Source id={sourceId} key={sourceId} type="geojson" data={points} promoteId="featureId">
      <Layer
        id={`${layerId}-bg`}
        type="circle"
        paint={{
          "circle-radius": ["+", 10, 3],
          "circle-color": colors.point.dashedSecondary,
          "circle-opacity": 0.9,
        }}
        filter={["==", ["get", "style"], "DASHED"]}
      />
      <Layer
        id={layerId}
        type="circle"
        paint={{
          "circle-radius": 10,
          "circle-color": colorExpression,
          "circle-stroke-width": 3,
          "circle-stroke-color": borderColorExpression,
          "circle-opacity": 0.3,
        }}
        filter={["==", ["get", "style"], "REGULAR"]}
      />
      <Layer
        id={`${layerId}-dashed`}
        type="circle"
        paint={{
          "circle-radius": 10,
          "circle-color": colorExpression,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": borderColorExpression,
          "circle-opacity": 0.3,
        }}
        filter={["==", ["get", "style"], "DASHED"]}
      />
      {interactive && (
        <Layer
          id={`${layerId}-click-target`}
          type="circle"
          paint={{
            "circle-radius": 10,
            "circle-opacity": 0,
          }}
        />
      )}
    </Source>
  )
}
