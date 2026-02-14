import { LabelPositionEnum } from "@prisma/client"
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
 * Get a point on a polygon's outer boundary based on label position.
 * Uses bbox to find the target side/corner, then snaps to the outer ring boundary to avoid spikes.
 */
const getPointOnBoundary = (
  polygonCoords: number[][][],
  labelPos: LabelPositionEnum = LabelPositionEnum.bottom,
): Dot => {
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
  const maxY = bounds[3] // Northernmost latitude
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  // Determine target point based on label position
  let targetCoords: [number, number]
  switch (labelPos) {
    case LabelPositionEnum.bottom:
      targetCoords = [centerX, minY]
      break
    case LabelPositionEnum.top:
      targetCoords = [centerX, maxY]
      break
    case LabelPositionEnum.left:
      targetCoords = [minX, centerY]
      break
    case LabelPositionEnum.right:
      targetCoords = [maxX, centerY]
      break
    case LabelPositionEnum.bottomLeft:
      targetCoords = [minX, minY]
      break
    case LabelPositionEnum.bottomRight:
      targetCoords = [maxX, minY]
      break
    case LabelPositionEnum.topLeft:
      targetCoords = [minX, maxY]
      break
    case LabelPositionEnum.topRight:
      targetCoords = [maxX, maxY]
      break
    default:
      // Fallback to bottom-center
      targetCoords = [centerX, minY]
  }

  // Create target point
  const targetPoint = point(targetCoords)

  // Find nearest point on outer ring boundary
  const nearest = nearestPointOnLine(outerRingLineString, targetPoint)
  return nearest.geometry.coordinates as Dot
}

/**
 * Calculate the optimal label position for a GeoJSON geometry.
 * For points, returns the coordinates directly.
 * For MultiPoint, returns the POSITION of the Point closest to the center of all points.
 * For lines and multi-lines, uses midpoint.
 * For polygons, places label at the specified side/corner of the polygon's bbox, then snaps to the outer boundary (avoids spikes).
 * For MultiPolygon, finds the largest polygon and places label at its boundary point based on labelPos.
 */
export const getLabelPosition = (geometry: Geometry, labelPos?: LabelPositionEnum) => {
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
      // Place label at the specified side/corner point on outer boundary
      return getPointOnBoundary(geometry.coordinates, labelPos)
    }
    case "MultiPolygon": {
      // Find the polygon with the largest area, then place label at its boundary point based on labelPos
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

      return getPointOnBoundary(largestPolygon, labelPos)
    }
    default: {
      // Fallback for unsupported geometry types
      return [0, 0] as Dot
    }
  }
}
