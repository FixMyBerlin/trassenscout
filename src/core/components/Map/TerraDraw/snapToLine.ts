import { lineString, point } from "@turf/helpers"
import { nearestPointOnLine } from "@turf/turf"
import type { Geometry, LineString } from "geojson"

export type SnapResult = {
  snapped: Geometry
  snappedCount: number
  originalGeometry: Geometry
}

/**
 * Snaps vertices of a geometry to the nearest point on a target line
 * Only snaps vertices within the threshold distance (in meters)
 * @param geometry - The geometry to snap (Point, LineString, Polygon, etc.)
 * @param targetLine - The LineString to snap to
 * @param thresholdMeters - Maximum distance in meters for snapping (default: 20)
 * @returns Object with snapped geometry, count of snapped vertices, and original geometry
 */
export const snapGeometryToLine = (
  geometry: Geometry,
  targetLine: LineString,
  thresholdMeters = 20,
) => {
  const originalGeometry = structuredClone(geometry)

  if (!geometry || !targetLine) {
    return { snapped: originalGeometry, snappedCount: 0, originalGeometry }
  }

  const targetLineFeature = lineString(targetLine.coordinates)
  let snappedCount = 0

  // Helper function to snap a single coordinate
  const snapCoordinate = (coord: [number, number] | GeoJSON.Position) => {
    const pointFeature = point(coord)
    const nearest = nearestPointOnLine(targetLineFeature, pointFeature, { units: "meters" })

    // Check if within threshold (distance is in km, convert to meters)
    const distanceMeters = (nearest.properties.dist || 0) * 1000

    if (distanceMeters <= thresholdMeters) {
      snappedCount++
      return nearest.geometry.coordinates as [number, number]
    }

    return coord
  }

  // Handle different geometry types
  if (geometry.type === "Point") {
    const snappedCoord = snapCoordinate(geometry.coordinates)
    const snappedGeom: Geometry = { type: "Point", coordinates: snappedCoord }
    return {
      snapped: snappedGeom,
      snappedCount,
      originalGeometry,
    }
  }

  if (geometry.type === "MultiPoint") {
    const snappedCoordinates = geometry.coordinates.map((coord) =>
      snapCoordinate(coord as [number, number]),
    )
    const snappedGeom: Geometry = { type: "MultiPoint", coordinates: snappedCoordinates }
    return {
      snapped: snappedGeom,
      snappedCount,
      originalGeometry,
    }
  }

  if (geometry.type === "LineString") {
    const snappedCoordinates = geometry.coordinates.map((coord) =>
      snapCoordinate(coord as [number, number]),
    )
    const snappedGeom: Geometry = { type: "LineString", coordinates: snappedCoordinates }
    return {
      snapped: snappedGeom,
      snappedCount,
      originalGeometry,
    }
  }

  if (geometry.type === "MultiLineString") {
    const snappedCoordinates = geometry.coordinates.map((line) =>
      line.map((coord) => snapCoordinate(coord as [number, number])),
    )
    const snappedGeom: Geometry = { type: "MultiLineString", coordinates: snappedCoordinates }
    return {
      snapped: snappedGeom,
      snappedCount,
      originalGeometry,
    }
  }

  if (geometry.type === "Polygon") {
    const snappedCoordinates = geometry.coordinates.map((ring) =>
      ring.map((coord) => snapCoordinate(coord as [number, number])),
    )
    const snappedGeom: Geometry = { type: "Polygon", coordinates: snappedCoordinates }
    return {
      snapped: snappedGeom,
      snappedCount,
      originalGeometry,
    }
  }

  if (geometry.type === "MultiPolygon") {
    const snappedCoordinates = geometry.coordinates.map((polygon) =>
      polygon.map((ring) => ring.map((coord) => snapCoordinate(coord as [number, number]))),
    )
    const snappedGeom: Geometry = { type: "MultiPolygon", coordinates: snappedCoordinates }
    return {
      snapped: snappedGeom,
      snappedCount,
      originalGeometry,
    }
  }

  // Unsupported geometry type, return original
  return { snapped: originalGeometry, snappedCount: 0, originalGeometry }
}

/**
 * Calculates how many vertices would be snapped without actually snapping them
 * Useful for preview/UI feedback
 */
export const getSnappedVertexCount = (
  geometry: Geometry,
  targetLine: LineString,
  thresholdMeters = 20,
) => {
  const result = snapGeometryToLine(geometry, targetLine, thresholdMeters)
  return result.snappedCount
}
