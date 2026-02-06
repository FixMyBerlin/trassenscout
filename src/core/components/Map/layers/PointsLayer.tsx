import { sharedColors } from "@/src/core/components/Map/colors/sharedColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import type { FeatureCollection, Point } from "geojson"
import { ExpressionSpecification } from "maplibre-gl"
import { Layer, Source } from "react-map-gl/maplibre"

const basePointLayerId = "layer_point_features"

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

  // Import colors based on colorSchema (points are typically subsubsection)
  const colors = colorSchema === "subsubsection" ? subsubsectionColors : subsubsectionColors

  const colorExpression: ExpressionSpecification = [
    "case",
    ["boolean", ["feature-state", "selected"], false],
    sharedColors.selected,
    ["boolean", ["feature-state", "hover"], false],
    sharedColors.hovered,
    // Points are areas that use inner fill color
    subsubsectionColors.pointInnerFill,
  ]

  const borderColorExpression: ExpressionSpecification = [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    sharedColors.hovered,
    ["boolean", ["feature-state", "selected"], false],
    colors.current, // Selected subsubsections use light blue (not yellow)
    ["case", ["get", "isCurrent"], colors.current, colors.unselected],
  ]

  return (
    <Source id={sourceId} key={sourceId} type="geojson" data={points} promoteId="featureId">
      {/* Background circle for dashed border effect (secondary color shows through gaps) */}
      <Layer
        id={`${layerId}-bg`}
        type="circle"
        paint={{
          "circle-radius": [
            "+",
            10, // radius for subsubsection points
            3, // border-width
          ],
          "circle-color": colors.dashedSecondary,
          "circle-opacity": 0.9,
        }}
        filter={["==", ["get", "style"], "DASHED"]}
      />
      {/* Main circle layer - regular border for REGULAR style */}
      <Layer
        id={layerId}
        type="circle"
        paint={{
          "circle-radius": 10, // radius for subsubsection points
          "circle-color": colorExpression,
          "circle-stroke-width": 3, // border-width for subsubsection points
          "circle-stroke-color": borderColorExpression,
          "circle-opacity": 0.3, // opacity for subsubsection points
        }}
        filter={["==", ["get", "style"], "REGULAR"]}
      />
      {/* Dashed style circle - thinner border to create visual gap effect */}
      <Layer
        id={`${layerId}-dashed`}
        type="circle"
        paint={{
          "circle-radius": 10, // radius for subsubsection points
          "circle-color": colorExpression,
          "circle-stroke-width": 1.5, // Thinner border (50% of 3px) to create visual gap effect
          "circle-stroke-color": borderColorExpression,
          "circle-opacity": 0.3, // opacity for subsubsection points
        }}
        filter={["==", ["get", "style"], "DASHED"]}
      />
      {interactive && (
        <Layer
          id={`${layerId}-click-target`}
          type="circle"
          paint={{
            "circle-radius": 10, // radius for subsubsection points
            "circle-opacity": 0,
          }}
        />
      )}
    </Source>
  )
}
