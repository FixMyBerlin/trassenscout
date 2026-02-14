import { mapLayerColorConfigs } from "@/src/core/components/Map/colors/mapLayerColorConfigs"
import type { FeatureCollection, Polygon } from "geojson"
import type { ExpressionSpecification } from "maplibre-gl"
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

const slugMatchExpression = [
  "==",
  ["coalesce", ["get", "projectSlug"], ["get", "subsubsectionSlug"], ["get", "subsectionSlug"]],
  ["coalesce", ["global-state", "highlightSlug"], ""],
] as ExpressionSpecification

export const PolygonsLayer = ({
  polygons,
  layerIdSuffix,
  interactive = true,
  colorSchema,
}: PolygonsLayerProps) => {
  if (!polygons || polygons.features.length === 0) return null

  const sourceId = getPolygonLayerId(layerIdSuffix)
  const layerId = getPolygonLayerId(layerIdSuffix)
  const colors = mapLayerColorConfigs[colorSchema]

  const colorExpression: ExpressionSpecification = [
    "case",
    slugMatchExpression,
    colors.polygon.hovered,
    ["boolean", ["feature-state", "selected"], false],
    colors.polygon.selected,
    ["case", ["get", "isCurrent"], colors.polygon.current, colors.polygon.unselected],
  ]

  return (
    <Source id={sourceId} key={sourceId} type="geojson" data={polygons} promoteId="featureId">
      <Layer
        id={`${layerId}-fill`}
        type="fill"
        paint={{
          "fill-color": colorExpression,
          "fill-opacity": 0.3,
        }}
      />
      <Layer
        id={`${layerId}-bg-outline`}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 3,
          "line-color": colors.polygon.dashedSecondary,
          "line-opacity": 0.8,
        }}
        filter={["==", ["get", "style"], "DASHED"]}
      />
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
