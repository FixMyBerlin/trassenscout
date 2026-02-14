import { mapLayerColorConfigs } from "@/src/core/components/Map/colors/mapLayerColorConfigs"
import type { FeatureCollection, Point } from "geojson"
import type { ExpressionSpecification } from "maplibre-gl"
import { Layer, Source } from "react-map-gl/maplibre"
import {
  HighlightSlugProperties,
  slugMatchExpression,
} from "./UnifiedFeaturesLayer"

const baseLineEndPointsLayerId = "layer_line_endpoints"

export const getLineEndPointsLayerId = (suffix: string) => `${baseLineEndPointsLayerId}${suffix}`

/** Slug and id props used by LineEndPointsLayer and useSlugFeatureMap for highlight/selection. */
export type LineEndPointFeatureProperties = HighlightSlugProperties & {
  featureId?: string
}

export type LineEndPointsLayerProps = {
  lineEndPoints:
    | FeatureCollection<Point, LineEndPointFeatureProperties>
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
    slugMatchExpression,
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
