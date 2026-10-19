import { featureCollection, lineString } from "@turf/helpers"
import { along, bearing, length } from "@turf/turf"
import { union } from "@turf/union"
import type { Feature, MultiPolygon, Polygon, Position } from "geojson"
import { mergeContiguousLines } from "@/src/shared/geometry/mergeContiguousLines"

export type PartOfLabelProperties = { label: string; rotate: number }

export type PartOfLabelAnchor = { coordinates: Position; rotate: number }

// Kilometres around the middle used for the text direction.
const DIRECTION_SPAN_KM = 0.05

// Groups spelling variants like "FRM 9" and "frm9".
export const partOfGroupKey = (value: string) => value.replace(/\s+/g, "").toUpperCase()

// Text angle clockwise from east, flipped so it never reads upside down.
const uprightTextAngle = (lineBearing: number) => (((lineBearing % 180) + 180) % 180) - 90

function labelAnchor(coordinates: Position[]): PartOfLabelAnchor {
  const line = lineString(coordinates)
  const middleKm = length(line) / 2
  const spanKm = Math.min(middleKm, DIRECTION_SPAN_KM)
  const rotate =
    spanKm > 0
      ? uprightTextAngle(bearing(along(line, middleKm - spanKm), along(line, middleKm + spanKm)))
      : 0
  return { coordinates: along(line, middleKm).geometry.coordinates, rotate }
}

function mergedAreaOutlines(areas: Feature<Polygon>[]) {
  if (areas.length === 0) return []

  try {
    const merged: Feature<Polygon | MultiPolygon> | null =
      areas.length === 1 ? areas[0]! : union(featureCollection(areas))
    if (merged) {
      const pieces =
        merged.geometry.type === "Polygon"
          ? [merged.geometry.coordinates]
          : merged.geometry.coordinates
      return pieces.map((rings) => rings[0]!)
    }
  } catch {
    // Turf rejects some stored polygons; label each one on its own instead.
  }

  return areas.map((area) => area.geometry.coordinates[0]!)
}

// One anchor in the middle of each connected line.
export const lineLabelAnchors = (lines: Position[][], toleranceDeg: number) =>
  mergeContiguousLines(lines, toleranceDeg).map(labelAnchor)

// One anchor on the outline of each connected area; expects unsimplified areas.
export const areaLabelAnchors = (areas: Feature<Polygon>[]) =>
  mergedAreaOutlines(areas).map(labelAnchor)
