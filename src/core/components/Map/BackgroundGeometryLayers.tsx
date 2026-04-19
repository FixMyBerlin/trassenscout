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
import {
  getSubsubsectionFeatures,
  type SubsubsectionForFeatures,
} from "@/src/core/components/Map/utils/getSubsubsectionFeatures"
import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { featureCollection } from "@turf/helpers"
import type { Feature, Point } from "geojson"

const LAYER_SUFFIX = "_background_geometry"

type Props = {
  subsections?: SubsectionForFeatures[]
  subsubsections?: SubsubsectionWithPosition[]
  subsubsectionGeometries?: SupportedGeometry[]
  showPoints?: boolean
  showLineEndPoints?: boolean
  colorSchema: "subsection" | "subsubsection"
}

/**
 * Non-interactive subsection / subsubsection geometries for map context (same styling as the main map).
 */
export function BackgroundGeometryLayers({
  subsections,
  subsubsections,
  subsubsectionGeometries,
  showPoints = true,
  showLineEndPoints = true,
  colorSchema,
}: Props) {
  const subsectionFeatures =
    subsections && subsections.length > 0
      ? getSubsectionFeatures({ subsections, highlight: "all" })
      : null

  const backgroundSubsubsections: SubsubsectionForFeatures[] = []
  subsubsectionGeometries?.forEach((geometry, index) => {
    const base = {
      slug: `background-subsubsection-${index}`,
      subsection: { slug: `background-subsection-${index}` },
      SubsubsectionStatus: null,
    }

    if (geometry.type === "LineString" || geometry.type === "MultiLineString") {
      backgroundSubsubsections.push({ ...base, type: "LINE", geometry })
      return
    }
    if (geometry.type === "Point" || geometry.type === "MultiPoint") {
      backgroundSubsubsections.push({ ...base, type: "POINT", geometry })
      return
    }
    if (geometry.type === "Polygon" || geometry.type === "MultiPolygon") {
      backgroundSubsubsections.push({ ...base, type: "POLYGON", geometry })
    }
  })

  const subsubsectionsForFeatures = [...(subsubsections ?? []), ...backgroundSubsubsections]

  const subsubsectionFeatures =
    subsubsectionsForFeatures.length > 0
      ? getSubsubsectionFeatures({
          subsubsections: subsubsectionsForFeatures,
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
    ...(showPoints ? subsubsectionFeatures?.points.features ?? [] : []),
  ]
  const points = pointFeatures.length === 0 ? undefined : featureCollection(pointFeatures)

  const endPointFeatures: Feature<Point, LineEndPointFeatureProperties>[] = [
    ...(showLineEndPoints ? subsectionFeatures?.lineEndPoints.features ?? [] : []),
    ...(showLineEndPoints ? subsubsectionFeatures?.lineEndPoints.features ?? [] : []),
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
