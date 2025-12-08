import { multiPoint, multiPolygon, polygon } from "@turf/helpers"
import { centerOfMass } from "@turf/turf"
import type { Geometry } from "geojson"
import { midPoint } from "./midPoint"

type Dot = [number, number]

/**
 * Calculate the center of mass for a GeoJSON geometry.
 * For points, returns the coordinates directly.
 * For MultiPoint, calculates center of all points.
 * For lines and multi-lines, uses midpoint (better for labels as it's on the line).
 * For polygons, uses turf.centerOfMass.
 */
export const getCenterOfMass = (geometry: Geometry) => {
  switch (geometry.type) {
    case "Point": {
      return geometry.coordinates as Dot
    }
    case "MultiPoint": {
      // Calculate center of all points in MultiPoint
      const feature = multiPoint(geometry.coordinates)
      const center = centerOfMass(feature)
      return center.geometry.coordinates as Dot
    }
    case "LineString": {
      return midPoint(geometry.coordinates) as Dot
    }
    case "MultiLineString": {
      const firstLine = geometry.coordinates[0]
      if (firstLine?.length) {
        return midPoint(firstLine) as Dot
      }
      return [0, 0] as Dot
    }
    case "Polygon": {
      return centerOfMass(polygon(geometry.coordinates)).geometry.coordinates as Dot
    }
    case "MultiPolygon": {
      return centerOfMass(multiPolygon(geometry.coordinates)).geometry.coordinates as Dot
    }
    default: {
      // Fallback for unsupported geometry types
      return [0, 0] as Dot
    }
  }
}
