import { mapLayerColorConfigs } from "@/src/core/components/Map/colors/mapLayerColorConfigs"
import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import type { FeatureCollection } from "geojson"
import type { ExpressionSpecification, FilterSpecification, MapGeoJSONFeature } from "maplibre-gl"
import { Layer, Source } from "react-map-gl/maplibre"

export const slugMatchExpression: ExpressionSpecification = [
  "any",
  [
    "==",
    ["get", "subsubsectionSlug"],
    ["coalesce", ["global-state", "highlightSubsubsectionSlug"], ""],
  ],
  ["==", ["get", "subsectionSlug"], ["coalesce", ["global-state", "highlightSubsectionSlug"], ""]],
  ["==", ["get", "projectSlug"], ["coalesce", ["global-state", "highlightProjectSlug"], ""]],
]

export const getUnifiedLayerId = (suffix: string) => `features${suffix}`

/** Shared properties for unified map features (lines, polygons, points). */
export type UnifiedFeatureProperties = {
  projectSlug?: string
  subsectionSlug?: string
  subsubsectionSlug?: string
  style?: "REGULAR" | "DASHED"
  isCurrent?: boolean
  featureId?: string
}

/** Slug properties used for hover highlight; hull and line-endpoint features use the same shape. */
export type HighlightSlugProperties = Pick<
  UnifiedFeatureProperties,
  "projectSlug" | "subsectionSlug" | "subsubsectionSlug"
>

/** Map feature with properties required for hover highlight (unified + line-endpoint layers). */
export type MapHighlightFeature = MapGeoJSONFeature & {
  properties: HighlightSlugProperties & { featureId: string }
}

export type UnifiedFeaturesLayerProps = {
  features: FeatureCollection<SupportedGeometry, UnifiedFeatureProperties | null> | undefined
  layerIdSuffix: string
  interactive?: boolean
  colorSchema: "subsection" | "subsubsection"
}

/**
 * Unified layer component that renders polygons, lines, and points from a single FeatureCollection.
 * Uses geometry-type filters to separate the different geometry types.
 * Rendering order: first layer = bottom, last layer = on top (MapLibre draws in array order).
 * Order here: polygons (bottom) → lines → points (top).
 */
export const UnifiedFeaturesLayer = ({
  features,
  layerIdSuffix,
  interactive = true,
  colorSchema,
}: UnifiedFeaturesLayerProps) => {
  if (!features || features.features.length === 0) return null

  const sourceId = getUnifiedLayerId(layerIdSuffix)
  const layerId = getUnifiedLayerId(layerIdSuffix)
  const colors = mapLayerColorConfigs[colorSchema]

  // Polygon color expression (slugMatch → selected → current/unselected)
  const polygonColorExpression: ExpressionSpecification = [
    "case",
    slugMatchExpression,
    colors.polygon.hovered,
    ["boolean", ["feature-state", "selected"], false],
    colors.polygon.selected,
    ["case", ["get", "isCurrent"], colors.polygon.current, colors.polygon.unselected],
  ]

  // Line color expression (slugMatch → selected → current/unselected)
  const lineColorExpression: ExpressionSpecification = [
    "case",
    slugMatchExpression,
    colors.line.hovered,
    ["boolean", ["feature-state", "selected"], false],
    colors.line.selected,
    ["case", ["get", "isCurrent"], colors.line.current, colors.line.unselected],
  ]

  // Point color expression (selected → slugMatch → default) - different order than polygon/line
  const pointColorExpression: ExpressionSpecification = [
    "case",
    ["boolean", ["feature-state", "selected"], false],
    colors.point.selected,
    slugMatchExpression,
    colors.point.hovered,
    colors.point.default,
  ]

  const pointBorderColorExpression: ExpressionSpecification = [
    "case",
    slugMatchExpression,
    colors.point.hovered,
    ["boolean", ["feature-state", "selected"], false],
    colors.point.selected,
    colors.point.default,
  ]

  // Geometry-type filters (expression spec: ["==", ["geometry-type"], value])
  const polygonFilter = ["==", ["geometry-type"], "Polygon"] satisfies FilterSpecification
  const lineFilter = ["==", ["geometry-type"], "LineString"] satisfies FilterSpecification
  const pointFilter = ["==", ["geometry-type"], "Point"] satisfies FilterSpecification

  return (
    <Source id={sourceId} key={sourceId} type="geojson" data={features} promoteId="featureId">
      {/* POLYGON LAYERS - first in list = bottom */}
      {/* Polygon fill */}
      <Layer
        id={`${layerId}-polygon-fill`}
        type="fill"
        filter={polygonFilter}
        paint={{
          "fill-color": polygonColorExpression,
          "fill-opacity": 0.3,
        }}
      />
      {/* Background border for dashed polygons */}
      <Layer
        id={`${layerId}-polygon-bg-outline`}
        type="line"
        filter={["all", polygonFilter, ["==", ["get", "style"], "DASHED"]]}
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 3,
          "line-color": colors.polygon.dashedSecondary,
          "line-opacity": 0.8,
        }}
      />
      {/* Regular polygon outline */}
      <Layer
        id={`${layerId}-polygon-outline`}
        type="line"
        filter={["all", polygonFilter, ["==", ["get", "style"], "REGULAR"]]}
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 3,
          "line-color": polygonColorExpression,
          "line-opacity": 0.8,
        }}
      />
      {/* Dashed polygon outline */}
      <Layer
        id={`${layerId}-polygon-dashed-outline`}
        type="line"
        filter={["all", polygonFilter, ["==", ["get", "style"], "DASHED"]]}
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 3,
          "line-color": polygonColorExpression,
          "line-opacity": 0.8,
          "line-dasharray": [2, 2],
        }}
      />
      {/* Polygon click target */}
      {interactive && (
        <Layer
          id={`${layerId}-polygon-click-target`}
          type="fill"
          filter={polygonFilter}
          paint={{
            "fill-opacity": 0,
          }}
        />
      )}

      {/* LINE LAYERS - middle; above polygons, below points */}
      {/* Line outline (border) */}
      <Layer
        id={`${layerId}-line-outline`}
        type="line"
        filter={lineFilter}
        layout={{
          "line-cap": colors.line.cap,
          "line-join": "round",
        }}
        paint={{
          "line-width": colors.line.outlineWidth,
          "line-color": colors.line.borderColor,
          "line-opacity": 0.6,
        }}
      />
      {/* Background for dashed lines */}
      <Layer
        id={`${layerId}-line-bg`}
        type="line"
        filter={["all", lineFilter, ["==", ["get", "style"], "DASHED"]]}
        layout={{
          "line-cap": colors.line.cap,
          "line-join": "round",
        }}
        paint={{
          "line-width": colors.line.width,
          "line-color": colors.line.dashedSecondary,
          "line-opacity": 0.9,
        }}
      />
      {/* Regular solid line */}
      <Layer
        id={`${layerId}-line-solid`}
        type="line"
        filter={["all", lineFilter, ["==", ["get", "style"], "REGULAR"]]}
        layout={{
          "line-cap": colors.line.cap,
          "line-join": "round",
        }}
        paint={{
          "line-width": colors.line.width,
          "line-color": lineColorExpression,
          "line-opacity": 1,
        }}
      />
      {/* Dashed line */}
      <Layer
        id={`${layerId}-line-dashed`}
        type="line"
        filter={["all", lineFilter, ["==", ["get", "style"], "DASHED"]]}
        layout={{
          "line-cap": colors.line.cap,
          "line-join": "round",
        }}
        paint={{
          "line-width": colors.line.width,
          "line-color": lineColorExpression,
          "line-opacity": 1,
          "line-dasharray": [1, 1],
        }}
      />
      {/* Line click target */}
      {interactive && (
        <Layer
          id={`${layerId}-line-click-target`}
          type="line"
          filter={lineFilter}
          layout={{
            "line-cap": colors.line.cap,
            "line-join": "round",
          }}
          paint={{
            "line-width": 20,
            "line-opacity": 0,
          }}
        />
      )}

      {/* POINT LAYERS - last in list = on top */}
      {/* Background circle for dashed points */}
      <Layer
        id={`${layerId}-point-bg`}
        type="circle"
        filter={["all", pointFilter, ["==", ["get", "style"], "DASHED"]]}
        paint={{
          "circle-radius": ["+", 10, 3],
          "circle-color": colors.point.dashedSecondary,
          "circle-opacity": 0.9,
        }}
      />
      {/* Regular point circle */}
      <Layer
        id={`${layerId}-point`}
        type="circle"
        filter={["all", pointFilter, ["==", ["get", "style"], "REGULAR"]]}
        paint={{
          "circle-radius": 10,
          "circle-color": pointColorExpression,
          "circle-stroke-width": 3,
          "circle-stroke-color": pointBorderColorExpression,
          "circle-opacity": 0.3,
        }}
      />
      {/* Dashed point circle */}
      <Layer
        id={`${layerId}-point-dashed`}
        type="circle"
        filter={["all", pointFilter, ["==", ["get", "style"], "DASHED"]]}
        paint={{
          "circle-radius": 10,
          "circle-color": pointColorExpression,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": pointBorderColorExpression,
          "circle-opacity": 0.3,
        }}
      />
      {/* Point click target */}
      {interactive && (
        <Layer
          id={`${layerId}-point-click-target`}
          type="circle"
          filter={pointFilter}
          paint={{
            "circle-radius": 10,
            "circle-opacity": 0,
          }}
        />
      )}
    </Source>
  )
}

/**
 * Returns only the click-target layer IDs that UnifiedFeaturesLayer creates for a given suffix.
 * These are the layers used for hit-testing in interactiveLayerIds.
 * Since setFeatureState is source-scoped, only these layers need to be in interactiveLayerIds
 * for click/move events to work correctly, while all visual layers will still reflect feature state changes.
 */
export function getUnifiedClickTargetLayerIds(suffix: string): string[] {
  const layerId = getUnifiedLayerId(suffix)
  return [
    `${layerId}-polygon-click-target`,
    `${layerId}-line-click-target`,
    `${layerId}-point-click-target`,
  ]
}
