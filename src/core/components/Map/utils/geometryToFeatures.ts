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
      return pointToGeoJSON(geometry) satisfies Feature<Point>[]
    }
    case "LineString":
    case "MultiLineString": {
      return lineStringToGeoJSON(geometry) satisfies Feature<LineString>[]
    }
    case "Polygon":
    case "MultiPolygon": {
      return polygonToGeoJSON(geometry) satisfies Feature<Polygon>[]
    }
  }
}
