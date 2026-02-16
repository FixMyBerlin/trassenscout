import { multiPolygon, polygon } from "@turf/helpers"
import { centerOfMass } from "@turf/turf"
import type { Geometry } from "geojson"
import { getLabelPosition } from "./getLabelPosition"

type Dot = [number, number]

/**
 * Calculate the central point for a GeoJSON geometry.
 * For points, lines, and multi-lines, uses getLabelPosition helper.
 * For polygons, uses turf.centerOfMass (returns center of polygon, not boundary).
 */
export const getCentralPointOfGeometry = (geometry: Geometry) => {
  switch (geometry.type) {
    case "Polygon": {
      return centerOfMass(polygon(geometry.coordinates)).geometry.coordinates as Dot
    }
    case "MultiPolygon": {
      return centerOfMass(multiPolygon(geometry.coordinates)).geometry.coordinates as Dot
    }
    default: {
      return getLabelPosition(geometry)
    }
  }
}
