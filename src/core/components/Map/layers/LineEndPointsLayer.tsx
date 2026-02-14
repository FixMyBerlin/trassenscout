import { mapLayerColorConfigs } from "@/src/core/components/Map/colors/mapLayerColorConfigs"
import type { FeatureCollection, Point } from "geojson"
import type { ExpressionSpecification } from "maplibre-gl"
import { Layer, Source } from "react-map-gl/maplibre"

const baseLineEndPointsLayerId = "layer_line_endpoints"

const lineIdMatchExpression: ExpressionSpecification = [
  "==",
  [
    "coalesce",
    ["get", "projectSlug"],
    ["get", "subsubsectionSlug"],
    ["get", "subsectionSlug"],
    ["get", "lineId"],
  ],
  ["coalesce", ["global-state", "highlightSlug"], ""],
]

export const getLineEndPointsLayerId = (suffix: string) => `${baseLineEndPointsLayerId}${suffix}`

export type LineEndPointsLayerProps = {
  lineEndPoints:
    | FeatureCollection<
        Point,
        {
          lineId?: string | number
          subsectionSlug?: string
          subsubsectionSlug?: string
          featureId?: string
        }
      >
    | undefined
  layerIdSuffix: string
  colorSchema: "subsection" | "subsubsection"
}

export const LineEndPointsLayer = ({
  lineEndPoints,
  layerIdSuffix,
  colorSchema,
}: LineEndPointsLayerProps) => {
  if (!lineEndPoints || lineEndPoints.features.length === 0) return null

  const id = getLineEndPointsLayerId(layerIdSuffix)
  const colors = mapLayerColorConfigs[colorSchema]

  const colorExpression: ExpressionSpecification = [
    "case",
    lineIdMatchExpression,
    colors.lineEndPoints.hovered,
    ["boolean", ["feature-state", "selected"], false],
    colors.lineEndPoints.selected,
    colors.lineEndPoints.default,
  ]

  return (
    <Source id={id} key={id} type="geojson" data={lineEndPoints} promoteId="featureId">
      <Layer
        id={id}
        type="circle"
        paint={{
          "circle-color": colorExpression,
          "circle-radius": colors.lineEndPoints.radius,
          "circle-stroke-color": colors.lineEndPoints.ring,
          "circle-stroke-width": colors.lineEndPoints.strokeWidth,
        }}
      />
    </Source>
  )
}
