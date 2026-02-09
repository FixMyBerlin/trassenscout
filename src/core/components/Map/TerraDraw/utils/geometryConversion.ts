import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { multiLineString, multiPoint, multiPolygon } from "@turf/helpers"
import type { GeoJSONStoreFeatures } from "terra-draw"

// Convert a geometry (including Multi* types) into an array of features
// Terra Draw only accepts Point, LineString, and Polygon - not Multi* geometries
// Note: Coordinates need to be rounded to 6 decimal places already
export const convertGeometryToFeatures = (geometry: SupportedGeometry) => {
  const features: GeoJSONStoreFeatures[] = []

  switch (geometry.type) {
    case "Point": {
      features.push({
        type: "Feature" as const,
        properties: { mode: "point" },
        geometry: geometry,
      })
      break
    }

    case "MultiPoint": {
      // Split MultiPoint into individual Point features
      geometry.coordinates.forEach((coords) => {
        features.push({
          type: "Feature" as const,
          properties: { mode: "point" },
          geometry: { type: "Point", coordinates: coords },
        })
      })
      break
    }

    case "LineString": {
      features.push({
        type: "Feature" as const,
        properties: { mode: "linestring" },
        geometry: geometry,
      })
      break
    }

    case "MultiLineString": {
      // Split MultiLineString into individual LineString features
      geometry.coordinates.forEach((coords) => {
        features.push({
          type: "Feature" as const,
          properties: { mode: "linestring" },
          geometry: { type: "LineString", coordinates: coords },
        })
      })
      break
    }

    case "Polygon": {
      features.push({
        type: "Feature" as const,
        properties: { mode: "polygon" },
        geometry: geometry,
      })
      break
    }

    case "MultiPolygon": {
      // Split MultiPolygon into individual Polygon features
      geometry.coordinates.forEach((coords) => {
        features.push({
          type: "Feature" as const,
          properties: { mode: "polygon" },
          geometry: { type: "Polygon", coordinates: coords },
        })
      })
      break
    }
  }

  return features
}

// Convert features to appropriate geometry
// Combines multiple features into Multi* geometry
export const convertFeaturesToGeometry = (features: GeoJSONStoreFeatures[]) => {
  if (features.length === 0) {
    return null
  }

  if (features.length === 1) {
    const feature = features[0]
    return feature ? feature.geometry : null
  }

  // Multiple features of same type - combine into Multi* geometry
  const firstFeature = features[0]
  if (!firstFeature) return null

  const firstType = firstFeature.geometry.type

  switch (firstType) {
    case "Point": {
      const coordinates = features
        .map((f) => (f.geometry.type === "Point" ? f.geometry.coordinates : null))
        .filter(Boolean)
      return multiPoint(coordinates).geometry
    }

    case "LineString": {
      const coordinates = features
        .map((f) => (f.geometry.type === "LineString" ? f.geometry.coordinates : null))
        .filter(Boolean)
      return multiLineString(coordinates).geometry
    }

    case "Polygon": {
      const coordinates = features
        .map((f) => (f.geometry.type === "Polygon" ? f.geometry.coordinates : null))
        .filter(Boolean)
      return multiPolygon(coordinates).geometry
    }
  }
}
