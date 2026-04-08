import { geometryToFeatures } from "@/src/core/components/Map/utils/geometryToFeatures"
import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { buffer } from "@turf/buffer"
import { featureCollection } from "@turf/helpers"
import { union } from "@turf/union"
import type { Feature, Geometry, MultiPolygon, Polygon } from "geojson"

function isPolygonalGeometry(geometry: Geometry): geometry is Polygon | MultiPolygon {
  return geometry.type === "Polygon" || geometry.type === "MultiPolygon"
}

function polygonalFeatureFromBufferOutput(f: Feature<Geometry> | undefined | null) {
  if (!f?.geometry || !isPolygonalGeometry(f.geometry)) return null
  return {
    type: "Feature" as const,
    properties: f.properties ?? {},
    geometry: f.geometry,
  }
}

export function computeBufferPolygonFeature(
  geometry: SupportedGeometry,
  bufferRadiusMeters: number,
) {
  const features = geometryToFeatures(geometry)
  if (features.length === 0) return null
  const buffered = buffer(featureCollection(features as Feature[]), bufferRadiusMeters, {
    units: "meters",
  })
  if (!buffered || buffered.features.length === 0) return null
  if (buffered.features.length === 1) {
    return polygonalFeatureFromBufferOutput(buffered.features[0] ?? null)
  }
  const merged = union(featureCollection(buffered.features))
  return polygonalFeatureFromBufferOutput(merged ?? null)
}
