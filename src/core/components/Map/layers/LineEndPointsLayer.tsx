import { sharedColors } from "@/src/core/components/Map/colors/sharedColors"
import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import type { FeatureCollection, Point } from "geojson"
import { ExpressionSpecification } from "maplibre-gl"
import { Layer, Source } from "react-map-gl/maplibre"

const baseLineEndPointsLayerId = "layer_line_endpoints"

export const getLineEndPointsLayerId = (suffix: string) => `${baseLineEndPointsLayerId}${suffix}`

export type LineEndPointsLayerProps = {
  lineEndPoints:
    | FeatureCollection<Point, { lineId?: string | number; featureId?: string }>
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

  const sourceId = getLineEndPointsLayerId(layerIdSuffix)
  const layerId = getLineEndPointsLayerId(layerIdSuffix)

  // Import colors based on colorSchema
  const colors = colorSchema === "subsubsection" ? subsubsectionColors : subsectionColors

  const colorExpression: ExpressionSpecification = [
    "case",
    [
      "==",
      // DashboardMap uses `projectSlug` to highlight all Subsections of the given project
      ["coalesce", ["get", "projectSlug"], ["get", "lineId"]],
      ["coalesce", ["global-state", "highlightSlug"], ""],
    ],
    sharedColors.hovered,
    ["boolean", ["feature-state", "selected"], false],
    sharedColors.selected,
    colors.lineDotSelected, // Inner fill color
  ]

  const strokeColorExpression: ExpressionSpecification = [
    "case",
    ["boolean", ["feature-state", "selected"], false],
    sharedColors.selected, // Yellow border when selected
    colors.lineDotRing, // Dark border on hover and default
  ]

  return (
    <Source id={sourceId} key={sourceId} type="geojson" data={lineEndPoints} promoteId="featureId">
      <Layer
        id={layerId}
        type="circle"
        paint={{
          "circle-color": colorExpression, // Inner fill
          "circle-radius": colors.lineDotRadius,
          "circle-stroke-color": strokeColorExpression, // Border color responds to hover/selected
          "circle-stroke-width": colors.lineDotStrokeWidth,
        }}
      />
    </Source>
  )
}
