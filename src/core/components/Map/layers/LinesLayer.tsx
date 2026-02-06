import { sharedColors } from "@/src/core/components/Map/colors/sharedColors"
import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import type { FeatureCollection, LineString } from "geojson"
import { ExpressionSpecification } from "maplibre-gl"
import { Layer, Source } from "react-map-gl/maplibre"

const baseLineLayerId = "layer_line_features"

export const getLineLayerId = (suffix: string) => `${baseLineLayerId}${suffix}`

export type LinesLayerProps = {
  lines:
    | FeatureCollection<
        LineString,
        {
          subsectionSlug?: string
          subsubsectionSlug?: string
          projectSlug?: string
          style?: "REGULAR" | "DASHED"
          isCurrent?: boolean
          featureId?: string
        }
      >
    | undefined
  layerIdSuffix: string
  interactive?: boolean
  colorSchema: "subsection" | "subsubsection"
}

export const LinesLayer = ({
  lines,
  layerIdSuffix,
  interactive = true,
  colorSchema,
}: LinesLayerProps) => {
  if (!lines || lines.features.length === 0) return null

  const sourceId = getLineLayerId(layerIdSuffix)
  const layerId = getLineLayerId(layerIdSuffix)

  // Import colors based on colorSchema
  const colors = colorSchema === "subsubsection" ? subsubsectionColors : subsectionColors

  const colorExpression: ExpressionSpecification = [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    sharedColors.hovered,
    ["boolean", ["feature-state", "selected"], false],
    colors.current, // Selected subsubsections use light blue (not yellow)
    ["case", ["get", "isCurrent"], colors.current, colors.unselected],
  ]

  return (
    <Source id={sourceId} key={sourceId} type="geojson" data={lines} promoteId="featureId">
      <Layer
        id={`${layerId}-outline`}
        type="line"
        layout={{
          "line-cap": colors.lineCap,
          "line-join": "round",
        }}
        paint={{
          "line-width": colors.lineOutlineWidth,
          "line-color": subsectionColors.lineDotSelected,
          "line-opacity": 0.6,
        }}
      />
      <Layer
        id={`${layerId}-bg`}
        type="line"
        layout={{
          "line-cap": colors.lineCap,
          "line-join": "round",
        }}
        paint={{
          "line-width": colors.lineWidth,
          "line-color": colors.dashedSecondary,
          "line-opacity": 0.9,
        }}
        filter={["==", ["get", "style"], "DASHED"]}
      />
      <Layer
        id={`${layerId}-solid`}
        type="line"
        layout={{
          "line-cap": colors.lineCap,
          "line-join": "round",
        }}
        paint={{
          "line-width": colors.lineWidth,
          "line-color": colorExpression,
          "line-opacity": 1,
        }}
        filter={["==", ["get", "style"], "REGULAR"]}
      />
      <Layer
        id={`${layerId}-dashed`}
        type="line"
        layout={{
          "line-cap": colors.lineCap,
          "line-join": "round",
        }}
        paint={{
          "line-width": colors.lineWidth,
          "line-color": colorExpression,
          "line-opacity": 1,
          "line-dasharray": [1, 1],
        }}
        filter={["==", ["get", "style"], "DASHED"]}
      />
      {interactive && (
        <Layer
          id={`${layerId}-click-target`}
          type="line"
          layout={{
            "line-cap": colors.lineCap,
            "line-join": "round",
          }}
          paint={{
            "line-width": 20,
            "line-opacity": 0,
          }}
        />
      )}
    </Source>
  )
}
