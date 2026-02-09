import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { lineString, point } from "@turf/helpers"
import { nearestPointOnLine } from "@turf/turf"
import type { LineString } from "geojson"

export type SnapResult = {
  snapped: SupportedGeometry
  snappedCount: number
  originalGeometry: SupportedGeometry
}

/**
 * Snaps vertices of a geometry to the nearest point on a target line
 * Only snaps vertices within the threshold distance (in meters)
 */
export const snapGeometryToLine = (
  geometry: SupportedGeometry,
  targetLine: LineString,
  thresholdMeters = 20,
) => {
  const originalGeometry = structuredClone(geometry)

  if (!geometry || !targetLine) {
    return { snapped: originalGeometry, snappedCount: 0, originalGeometry }
  }

  const targetLineFeature = lineString(targetLine.coordinates)

  // Pure helper: returns coordinate and whether it was snapped
  const snapCoordinate = (coord: GeoJSON.Position) => {
    const pointFeature = point(coord)
    const nearest = nearestPointOnLine(targetLineFeature, pointFeature, { units: "meters" })
    const distanceMeters = (nearest.properties.dist || 0) * 1000

    if (distanceMeters <= thresholdMeters) {
      return { coordinate: nearest.geometry.coordinates, wasSnapped: true }
    }

    return { coordinate: coord, wasSnapped: false }
  }

  switch (geometry.type) {
    case "Point": {
      const result = snapCoordinate(geometry.coordinates)
      return {
        snapped: { type: "Point" as const, coordinates: result.coordinate },
        snappedCount: result.wasSnapped ? 1 : 0,
        originalGeometry,
      }
    }

    case "MultiPoint": {
      const results = geometry.coordinates.map((coord) => snapCoordinate(coord))
      return {
        snapped: { type: "MultiPoint" as const, coordinates: results.map((r) => r.coordinate) },
        snappedCount: results.filter((r) => r.wasSnapped).length,
        originalGeometry,
      }
    }

    case "LineString": {
      const results = geometry.coordinates.map((coord) => snapCoordinate(coord))
      return {
        snapped: { type: "LineString" as const, coordinates: results.map((r) => r.coordinate) },
        snappedCount: results.filter((r) => r.wasSnapped).length,
        originalGeometry,
      }
    }

    case "MultiLineString": {
      const results = geometry.coordinates.map((line) => line.map((coord) => snapCoordinate(coord)))
      return {
        snapped: {
          type: "MultiLineString" as const,
          coordinates: results.map((line) => line.map((r) => r.coordinate)),
        },
        snappedCount: results.flat().filter((r) => r.wasSnapped).length,
        originalGeometry,
      }
    }

    case "Polygon": {
      const results = geometry.coordinates.map((ring) => ring.map((coord) => snapCoordinate(coord)))
      return {
        snapped: {
          type: "Polygon" as const,
          coordinates: results.map((ring) => ring.map((r) => r.coordinate)),
        },
        snappedCount: results.flat().filter((r) => r.wasSnapped).length,
        originalGeometry,
      }
    }

    case "MultiPolygon": {
      const results = geometry.coordinates.map((polygon) =>
        polygon.map((ring) => ring.map((coord) => snapCoordinate(coord))),
      )
      return {
        snapped: {
          type: "MultiPolygon" as const,
          coordinates: results.map((polygon) =>
            polygon.map((ring) => ring.map((r) => r.coordinate)),
          ),
        },
        snappedCount: results.flat(2).filter((r) => r.wasSnapped).length,
        originalGeometry,
      }
    }
  }
}
