import { featureCollection, multiPoint, point, polygon } from "@turf/helpers"
import {
  area,
  bbox,
  centerOfMass,
  length,
  lineString,
  nearestPoint,
  nearestPointOnLine,
} from "@turf/turf"
import type { Geometry } from "geojson"
import { midPoint } from "./midPoint"

type Dot = [number, number]

/**
 * Get the bottom-center point on a polygon's outer boundary.
 * Uses bbox to find southernmost latitude and center longitude,
 * then snaps to the outer ring boundary to avoid spikes.
 */
const getBottomCenterOnBoundary = (polygonCoords: number[][][]): Dot => {
  // Extract outer ring (first ring) as LineString
  const outerRing = polygonCoords[0]
  if (!outerRing || outerRing.length < 2) {
    return [0, 0] as Dot
  }

  const outerRingLineString = lineString(outerRing)
  const polygonFeature = polygon(polygonCoords)

  // Get bounding box: [minX, minY, maxX, maxY]
  const bounds = bbox(polygonFeature)
  const minX = bounds[0]
  const minY = bounds[1] // Southernmost latitude
  const maxX = bounds[2]
  const centerLng = (minX + maxX) / 2

  // Create target point at bottom-center
  const targetPoint = point([centerLng, minY])

  // Find nearest point on outer ring boundary
  const nearest = nearestPointOnLine(outerRingLineString, targetPoint)
  return nearest.geometry.coordinates as Dot
}

/**
 * Calculate the optimal label position for a GeoJSON geometry.
 * For points, returns the coordinates directly.
 * For MultiPoint, returns the POSITION of the Point closest to the center of all points.
 * For lines and multi-lines, uses midpoint.
 * For polygons, places label at bottom-center point on the outer boundary (avoids spikes).
 * For MultiPolygon, finds the largest polygon and places label at its bottom-center boundary point.
 */
export const getLabelPosition = (geometry: Geometry) => {
  switch (geometry.type) {
    case "Point": {
      return geometry.coordinates as Dot
    }
    case "MultiPoint": {
      // Calculate center of all points, then find the point closest to that center
      const feature = multiPoint(geometry.coordinates)
      const centerFeature = centerOfMass(feature)

      // Create FeatureCollection of all points
      const pointsCollection = featureCollection(geometry.coordinates.map((coord) => point(coord)))

      // Find the nearest point to the center using turf's nearestPoint
      const nearest = nearestPoint(centerFeature, pointsCollection)
      return nearest.geometry.coordinates as Dot
    }
    case "LineString": {
      return midPoint(geometry.coordinates) as Dot
    }
    case "MultiLineString": {
      // Find the longest line and return its midpoint
      let longestLine: number[][] | null = null
      let maxLength = 0

      for (const coords of geometry.coordinates) {
        if (coords.length < 2) continue
        const line = lineString(coords)
        const lineLength = length(line)
        if (lineLength > maxLength) {
          maxLength = lineLength
          longestLine = coords
        }
      }

      if (longestLine && longestLine.length >= 2) {
        return midPoint(longestLine) as Dot
      }

      // Fallback: if no valid line found, return first coordinate of first line
      const firstLine = geometry.coordinates[0]
      if (firstLine && firstLine.length > 0) {
        return firstLine[0] as Dot
      }

      // Guard position for invalid geometry
      return [0, 0] as Dot
    }
    case "Polygon": {
      // Place label at bottom-center point on outer boundary
      return getBottomCenterOnBoundary(geometry.coordinates)
    }
    case "MultiPolygon": {
      // Find the polygon with the largest area, then place label at its bottom-center boundary
      if (geometry.coordinates.length === 0) {
        return [0, 0] as Dot
      }

      let largestPolygon = geometry.coordinates[0]!
      let maxArea = 0

      for (const coords of geometry.coordinates) {
        const polygonFeature = polygon(coords)
        const polygonArea = area(polygonFeature)
        if (polygonArea > maxArea) {
          maxArea = polygonArea
          largestPolygon = coords
        }
      }

      return getBottomCenterOnBoundary(largestPolygon)
    }
    default: {
      // Fallback for unsupported geometry types
      return [0, 0] as Dot
    }
  }
}
