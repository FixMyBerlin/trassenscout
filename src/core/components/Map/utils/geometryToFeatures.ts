import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { Feature, LineString, Point, Polygon } from "geojson"
import { lineStringToGeoJSON } from "./lineStringToGeoJSON"
import { pointToGeoJSON } from "./pointToGeoJSON"
import { polygonToGeoJSON } from "./polygonToGeoJSON"

/**
 * Converts a SupportedGeometry to an array of GeoJSON Features.
 * Handles all supported geometry types: Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon.
 */
export const geometryToFeatures = (geometry: SupportedGeometry) => {
  switch (geometry.type) {
    case "Point":
    case "MultiPoint": {
      const features = pointToGeoJSON(geometry)
      return (features ?? []) satisfies Feature<Point>[]
    }
    case "LineString":
    case "MultiLineString": {
      const features = lineStringToGeoJSON(geometry)
      return (features ?? []) satisfies Feature<LineString>[]
    }
    case "Polygon":
    case "MultiPolygon": {
      const features = polygonToGeoJSON(geometry)
      return (features ?? []) satisfies Feature<Polygon>[]
    }
  }
}
