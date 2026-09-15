import { featureCollection } from "@turf/helpers"
import { bbox } from "@turf/turf"
import type { Feature } from "geojson"
import { SupportedGeometry } from "@/src/shared/geometry/geometrySchemas"
import { isRenderableGeometry } from "@/src/shared/geometry/isRenderableGeometry"
import { GERMANY_VIEW_BOUNDS } from "../germanyViewBounds"
import { geometryToFeatures } from "./geometryToFeatures"

export type Bbox2D = [number, number, number, number]

export const geometriesBbox = (geometries: SupportedGeometry[]) => {
  const features: Feature[] = geometries
    .filter(isRenderableGeometry)
    .flatMap((geometry) => geometryToFeatures(geometry) as Feature[])

  if (features.length === 0) return GERMANY_VIEW_BOUNDS as Bbox2D

  // bbox returns [minX, minY, maxX, maxY] which is LngLatBoundsLike but types it as GeoJSON.Bbox
  // which has altitude types as well.
  return bbox(featureCollection(features)) as Bbox2D
}

export const geometryBbox = (geometry: SupportedGeometry) => geometriesBbox([geometry])
