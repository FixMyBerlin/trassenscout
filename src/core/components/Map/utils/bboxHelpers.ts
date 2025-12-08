import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { featureCollection } from "@turf/helpers"
import { bbox } from "@turf/turf"
import { Feature } from "geojson"
import { geometryToFeatures } from "./geometryToFeatures"

type Bbox2D = [number, number, number, number]

export const geometryBbox = (geometry: SupportedGeometry) => {
  const features: Feature<SupportedGeometry>[] = geometryToFeatures(geometry)
  const collection = featureCollection(features)
  // bbox returns [minX, minY, maxX, maxY] which is LngLatBoundsLike but types it as GeoJSON.Bbox which has altitude types as well.
  return bbox(collection) as Bbox2D
}

export const geometriesBbox = (geometries: SupportedGeometry[]) => {
  const allFeatures: Feature<SupportedGeometry>[] = geometries.flatMap((geometry) => {
    const features: Feature<SupportedGeometry>[] = geometryToFeatures(geometry)
    return features
  })
  const collection = featureCollection(allFeatures)
  // bbox returns [minX, minY, maxX, maxY] which is LngLatBoundsLike but types it as GeoJSON.Bbox which has altitude types as well.
  return bbox(collection) as Bbox2D
}
