import { sharedColors } from "@/src/core/components/Map/colors/sharedColors"
import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import type { FeatureCollection, Polygon } from "geojson"
import { ExpressionSpecification } from "maplibre-gl"
import { Layer, Source } from "react-map-gl/maplibre"

const basePolygonLayerId = "layer_polygon_features"

export const getPolygonLayerId = (suffix: string) => `${basePolygonLayerId}${suffix}`

export type PolygonsLayerProps = {
  polygons:
    | FeatureCollection<
        Polygon,
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

export const PolygonsLayer = ({
  polygons,
  layerIdSuffix,
  interactive = true,
  colorSchema,
}: PolygonsLayerProps) => {
  if (!polygons || polygons.features.length === 0) return null

  const sourceId = getPolygonLayerId(layerIdSuffix)
  const layerId = getPolygonLayerId(layerIdSuffix)

  // Import colors based on colorSchema
  const colors = colorSchema === "subsubsection" ? subsubsectionColors : subsectionColors

  const colorExpression: ExpressionSpecification = [
    "case",
    [
      "==",
      // DashboardMap uses `projectSlug` to highlight all Subsections of the given project
      ["coalesce", ["get", "projectSlug"], ["get", "subsubsectionSlug"], ["get", "subsectionSlug"]],
      ["coalesce", ["global-state", "highlightSlug"], ""],
    ],
    sharedColors.hovered,
    ["boolean", ["feature-state", "selected"], false],
    colors.current, // Selected subsubsections use light blue (not yellow)
    // Use feature properties: isCurrent
    [
      "case",
      ["get", "isCurrent"],
      colors.current, // Current entry (isCurrent=true)
      colors.unselected, // Unselected entry (isCurrent=false)
    ],
  ]

  return (
    <Source id={sourceId} key={sourceId} type="geojson" data={polygons} promoteId="featureId">
      {/* Regular polygon layers */}
      <Layer
        id={`${layerId}-fill`}
        type="fill"
        paint={{
          "fill-color": colorExpression,
          "fill-opacity": 0.3,
        }}
      />
      {/* Background border for dashed polygons (secondary color shows through gaps) */}
      <Layer
        id={`${layerId}-bg-outline`}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 3,
          "line-color": colors.dashedSecondary,
          "line-opacity": 0.8,
        }}
        filter={["==", ["get", "style"], "DASHED"]}
      />
      {/* Regular outline (solid border) */}
      <Layer
        id={`${layerId}-outline`}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 3,
          "line-color": colorExpression,
          "line-opacity": 0.8,
        }}
        filter={["==", ["get", "style"], "REGULAR"]}
      />
      {/* Dashed outline */}
      <Layer
        id={`${layerId}-dashed-outline`}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 3,
          "line-color": colorExpression,
          "line-opacity": 0.8,
          "line-dasharray": [2, 2],
        }}
        filter={["==", ["get", "style"], "DASHED"]}
      />
      {interactive && (
        <Layer
          id={`${layerId}-click-target`}
          type="fill"
          paint={{
            "fill-opacity": 0,
          }}
        />
      )}
    </Source>
  )
}
