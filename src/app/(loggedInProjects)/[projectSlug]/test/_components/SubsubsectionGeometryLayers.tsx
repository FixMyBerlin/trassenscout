"use client"

import { LineEndPointsLayer } from "@/src/core/components/Map/layers/LineEndPointsLayer"
import { UnifiedFeaturesLayer } from "@/src/core/components/Map/layers/UnifiedFeaturesLayer"
import { getSubsubsectionFeatures } from "@/src/core/components/Map/utils/getSubsubsectionFeatures"
import { mergeFeatureCollections } from "@/src/core/components/Map/utils/mergeFeatureCollections"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { useMemo } from "react"

const LAYER_SUFFIX = "_alkis_test_subsubsection"

type Props = {
  subsubsections: SubsubsectionWithPosition[]
}

/**
 * Renders line / polygon / point geometries (same styling as the main map), without
 * click targets — navigation stays on markers, list, and parcel popup.
 */
export function SubsubsectionGeometryLayers({ subsubsections }: Props) {
  const { lines, points, polygons, lineEndPoints } = useMemo(
    () =>
      getSubsubsectionFeatures({
        subsubsections,
        selectedSubsubsectionSlug: null,
      }),
    [subsubsections],
  )

  const unifiedFeatures = useMemo(
    () => mergeFeatureCollections(lines, polygons, points),
    [lines, polygons, points],
  )

  if (!unifiedFeatures || unifiedFeatures.features.length === 0) {
    return null
  }

  return (
    <UnifiedFeaturesLayer
      features={unifiedFeatures}
      layerIdSuffix={LAYER_SUFFIX}
      interactive={false}
      colorSchema="subsubsection"
      layersBetweenLinesAndPoints={
        lineEndPoints && lineEndPoints.features.length > 0 ? (
          <LineEndPointsLayer
            lineEndPoints={lineEndPoints}
            layerIdSuffix={LAYER_SUFFIX}
            colorSchema="subsubsection"
          />
        ) : undefined
      }
    />
  )
}
