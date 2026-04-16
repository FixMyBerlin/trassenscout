"use client"

import {
  LineEndPointsLayer,
  type LineEndPointFeatureProperties,
} from "@/src/core/components/Map/layers/LineEndPointsLayer"
import {
  UnifiedFeaturesLayer,
  type UnifiedFeatureProperties,
} from "@/src/core/components/Map/layers/UnifiedFeaturesLayer"
import {
  getSubsectionFeatures,
  type SubsectionForFeatures,
} from "@/src/core/components/Map/utils/getSubsectionFeatures"
import { getSubsubsectionFeatures } from "@/src/core/components/Map/utils/getSubsubsectionFeatures"
import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { featureCollection } from "@turf/helpers"
import type { Feature, Point } from "geojson"

const LAYER_SUFFIX = "_background_geometry"

type Props = {
  subsections?: SubsectionForFeatures[]
  subsubsections?: SubsubsectionWithPosition[]
  colorSchema: "subsection" | "subsubsection"
}

/**
 * Non-interactive subsection / subsubsection geometries for map context (same styling as the main map).
 */
export function BackgroundGeometryLayers({ subsections, subsubsections, colorSchema }: Props) {
  const subsectionFeatures =
    subsections && subsections.length > 0
      ? getSubsectionFeatures({ subsections, highlight: "all" })
      : null

  const subsubsectionFeatures =
    subsubsections && subsubsections.length > 0
      ? getSubsubsectionFeatures({
          subsubsections,
          selectedSubsubsectionSlug: null,
        })
      : null

  const lineFeatures: Feature<SupportedGeometry, UnifiedFeatureProperties>[] = [
    ...(subsectionFeatures?.lines.features ?? []),
    ...(subsubsectionFeatures?.lines.features ?? []),
  ]
  const lines = lineFeatures.length === 0 ? undefined : featureCollection(lineFeatures)

  const polygonFeatures: Feature<SupportedGeometry, UnifiedFeatureProperties>[] = [
    ...(subsectionFeatures?.polygons.features ?? []),
    ...(subsubsectionFeatures?.polygons.features ?? []),
  ]
  const polygons = polygonFeatures.length === 0 ? undefined : featureCollection(polygonFeatures)

  const pointFeatures: Feature<SupportedGeometry, UnifiedFeatureProperties>[] = [
    ...(subsubsectionFeatures?.points.features ?? []),
  ]
  const points = pointFeatures.length === 0 ? undefined : featureCollection(pointFeatures)

  const endPointFeatures: Feature<Point, LineEndPointFeatureProperties>[] = [
    ...(subsectionFeatures?.lineEndPoints.features ?? []),
    ...(subsubsectionFeatures?.lineEndPoints.features ?? []),
  ]
  const lineEndPoints =
    endPointFeatures.length === 0 ? undefined : featureCollection(endPointFeatures)

  const unifiedFeatureList: Feature<SupportedGeometry, UnifiedFeatureProperties>[] = [
    ...(lines?.features ?? []),
    ...(polygons?.features ?? []),
    ...(points?.features ?? []),
  ]
  const unifiedFeatures =
    unifiedFeatureList.length === 0 ? undefined : featureCollection(unifiedFeatureList)

  if (!unifiedFeatures || unifiedFeatures.features.length === 0) {
    return null
  }

  return (
    <UnifiedFeaturesLayer
      features={unifiedFeatures}
      layerIdSuffix={LAYER_SUFFIX}
      interactive={false}
      colorSchema={colorSchema}
      layersBetweenLinesAndPoints={
        lineEndPoints && lineEndPoints.features.length > 0 ? (
          <LineEndPointsLayer
            lineEndPoints={lineEndPoints}
            layerIdSuffix={LAYER_SUFFIX}
            colorSchema={colorSchema}
          />
        ) : undefined
      }
    />
  )
}
