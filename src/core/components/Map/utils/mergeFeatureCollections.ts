import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { featureCollection } from "@turf/helpers"
import type { Feature, FeatureCollection, GeoJsonProperties } from "geojson"

/**
 * Merges multiple FeatureCollections into a single FeatureCollection.
 * Useful for combining lines, polygons, and points into one source for unified rendering.
 */
export function mergeFeatureCollections<P extends GeoJsonProperties = GeoJsonProperties>(
  ...collections: Array<FeatureCollection<SupportedGeometry, P> | undefined>
) {
  const allFeatures: Feature<SupportedGeometry, P>[] = []

  for (const collection of collections) {
    if (collection?.features) {
      allFeatures.push(...collection.features)
    }
  }

  if (allFeatures.length === 0) {
    return undefined
  }

  return featureCollection(allFeatures) satisfies FeatureCollection<SupportedGeometry, P>
}
