import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import type { FeatureCollection, Point } from "geojson"
import { useMemo } from "react"
import type { LineEndPointFeatureProperties } from "./layers/LineEndPointsLayer"
import type { UnifiedFeatureProperties } from "./layers/UnifiedFeaturesLayer"

export type SlugFeatureIds = {
  featureIds: string[]
  endPointIds: string[]
}

/**
 * Builds a map from slug to feature IDs, grouping both unified features (lines, polygons, points)
 * and line end points by their slug (subsubsectionSlug or subsectionSlug). This allows highlighting all features belonging to
 * the same subsubsection/subsection when clicking on any feature.
 *
 * @param unifiedFeatures - Merged FeatureCollection of lines, polygons, and points
 * @param lineEndPoints - FeatureCollection of line end point features
 * @returns Map from slug (string) to SlugFeatureIds containing featureIds and endPointIds
 */
export function useSlugFeatureMap(
  unifiedFeatures:
    | FeatureCollection<SupportedGeometry, UnifiedFeatureProperties | null>
    | undefined,
  lineEndPoints: FeatureCollection<Point, LineEndPointFeatureProperties> | undefined,
) {
  return useMemo(() => {
    const map = new Map<string, SlugFeatureIds>()

    const getSlug = (props: LineEndPointFeatureProperties) =>
      props.subsubsectionSlug || props.subsectionSlug

    // Process unified features (lines, polygons, points)
    if (unifiedFeatures) {
      unifiedFeatures.features.forEach((f) => {
        const slug = getSlug(f.properties || {})
        const featureId = f.properties?.featureId
        if (slug && featureId) {
          const featureIds = map.get(slug) ?? {
            featureIds: [],
            endPointIds: [],
          }
          featureIds.featureIds.push(featureId)
          map.set(slug, featureIds)
        }
      })
    }

    // Process endpoints
    if (lineEndPoints) {
      lineEndPoints.features.forEach((f) => {
        const slug = getSlug(f.properties || {})
        const featureId = f.properties?.featureId
        if (slug && featureId) {
          const featureIds = map.get(slug) ?? {
            featureIds: [],
            endPointIds: [],
          }
          featureIds.endPointIds.push(featureId)
          map.set(slug, featureIds)
        }
      })
    }

    return map
  }, [unifiedFeatures, lineEndPoints])
}
