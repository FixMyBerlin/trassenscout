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

  const id = getLineEndPointsLayerId(layerIdSuffix)
  const colors = colorSchema === "subsubsection" ? subsubsectionColors : subsectionColors

  const colorExpression: ExpressionSpecification = [
    "case",
    [
      "==",
      // DashboardMap uses `projectSlug` to highlight all Subsections of the given project
      ["coalesce", ["get", "projectSlug"], ["get", "lineId"]],
      ["coalesce", ["global-state", "highlightSlug"], ""],
    ],
    sharedColors.hovered, // Yellow hover color
    ["boolean", ["feature-state", "selected"], false],
    colors.lineDotSelected, // Light blue fill when selected (not yellow)
    colors.lineDotUnselected, // Default blue fill
  ]

  return (
    <Source id={id} key={id} type="geojson" data={lineEndPoints} promoteId="featureId">
      <Layer
        id={id}
        type="circle"
        paint={{
          "circle-color": colorExpression,
          "circle-radius": colors.lineDotRadius,
          "circle-stroke-color": colors.lineDotRing,
          "circle-stroke-width": colors.lineDotStrokeWidth,
        }}
      />
    </Source>
  )
}
