import type { MapData } from "@/src/app/beteiligung/_shared/types"
import { MapSourceType } from "@/src/app/beteiligung/_shared/types"
import { bbox, lineString, multiLineString, point, polygon } from "@turf/turf"

export type GeometryType = "point" | "lineString" | "multiLineString" | "polygon" | "unknown"

/** `location` value for SwitchableMap (GeoJSON Point → `{ lng, lat }`). */
export type SwitchableMapLocationPoint = { lng: number; lat: number }

/**
 * Normalizes a stored field value to a JSON string that {@link detectGeometryType} understands
 * (point = `[lng, lat]`).
 */
export function geometryStringForSwitchableMapLocationPoint(value: unknown): string | null {
  if (value == null || value === "") return null
  if (typeof value === "object" && value !== null && "lng" in value && "lat" in value) {
    const o = value as { lng: unknown; lat: unknown }
    if (typeof o.lng === "number" && typeof o.lat === "number") {
      return JSON.stringify([o.lng, o.lat])
    }
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown
      if (
        Array.isArray(parsed) &&
        parsed.length >= 2 &&
        typeof parsed[0] === "number" &&
        typeof parsed[1] === "number"
      ) {
        return JSON.stringify([parsed[0], parsed[1]])
      }
      if (typeof parsed === "object" && parsed !== null && "lng" in parsed && "lat" in parsed) {
        const p = parsed as { lng: unknown; lat: unknown }
        if (typeof p.lng === "number" && typeof p.lat === "number") {
          return JSON.stringify([p.lng, p.lat])
        }
      }
      return value
    } catch {
      return null
    }
  }
  return null
}

export const detectGeometryType = (geometryString: string): GeometryType => {
  try {
    const parsedGeometry = JSON.parse(geometryString)

    // point (array with 2 numbers)
    if (
      Array.isArray(parsedGeometry) &&
      parsedGeometry.length === 2 &&
      typeof parsedGeometry[0] === "number" &&
      typeof parsedGeometry[1] === "number"
    ) {
      return "point"
    }

    // line, multiline or polygon (array of coordinate pairs or arrays)
    if (Array.isArray(parsedGeometry) && Array.isArray(parsedGeometry[0])) {
      // multiLineString (array of arrays of coordinate pairs)
      // multiLineString structure: [[[x1,y1],[x2,y2]], [[x3,y3],[x4,y4]]]
      if (Array.isArray(parsedGeometry[0][0]) && typeof parsedGeometry[0][0][0] === "number") {
        return "multiLineString"
      }

      // polygon (closed loop with at least 4 coordinates)
      if (parsedGeometry.length >= 4) {
        const firstCoord = parsedGeometry[0]
        const lastCoord = parsedGeometry[parsedGeometry.length - 1]
        if (
          Array.isArray(firstCoord) &&
          Array.isArray(lastCoord) &&
          firstCoord.length >= 2 &&
          lastCoord.length >= 2 &&
          firstCoord[0] === lastCoord[0] &&
          firstCoord[1] === lastCoord[1]
        ) {
          return "polygon"
        }
      }
      // if not a closed loop or multiline, assume it's a lineString
      return "lineString"
    }

    return "unknown"
  } catch (error) {
    return "unknown"
  }
}

/**
 * Parses the `location` field for SwitchableMap. **Points only** — uses {@link detectGeometryType}.
 * @throws If the value encodes a non-point geometry (line, polygon, etc.).
 */
export function parseSwitchableMapLocationFieldValue(
  value: unknown,
): SwitchableMapLocationPoint | null {
  const str = geometryStringForSwitchableMapLocationPoint(value)
  if (str == null) return null
  const type = detectGeometryType(str)
  if (type !== "point") {
    throw new Error(
      `SwitchableMap only supports point locations; expected a point, got geometry type "${type}"`,
    )
  }
  const parsed = JSON.parse(str) as [number, number]
  return { lng: parsed[0], lat: parsed[1] }
}

export const createGeoJSONFromString = (
  geometryString: string,
  properties?: {
    [name: string]: any
  },
  options?: { [id: string]: string | number },
) => {
  const geometryType = detectGeometryType(geometryString)
  const parsedGeometry = JSON.parse(geometryString)

  switch (geometryType) {
    case "point":
      return point(
        parsedGeometry as [number, number],
        { ...properties, geometryType: "point" },
        options,
      )
    case "lineString":
      return lineString(
        parsedGeometry as [number, number][],
        { ...properties, geometryType: "line" },
        options,
      )
    case "multiLineString":
      return multiLineString(
        parsedGeometry as [number, number][][],
        { ...properties, geometryType: "line" },
        options,
      )
    case "polygon":
      return polygon(
        [parsedGeometry as [number, number][]],
        { ...properties, geometryType: "polygon" },
        options,
      )
    default:
      throw new Error(`Unsupported geometry type: ${geometryType}`)
  }
}

export const createBboxFromGeometryString = (
  geometryString: string,
): [number, number, number, number] | null => {
  try {
    const geoJsonFeature = createGeoJSONFromString(geometryString)
    return bbox(geoJsonFeature) as [number, number, number, number]
  } catch (error) {
    console.error("Error creating bbox from geometry string:", error)
    return null
  }
}

// Create initial bounds based on existing geometry value
export const getInitialViewStateFromGeometryString = (geometryString: string): any | null => {
  if (!geometryString || typeof geometryString !== "string") {
    return null
  }

  const geometryType = detectGeometryType(geometryString)

  if (geometryType === "point") {
    // For points, center on the point with a reasonable zoom level
    const geoJSON = createGeoJSONFromString(geometryString)
    const [lng, lat] = geoJSON.geometry.coordinates
    return {
      latitude: lat,
      longitude: lng,
      zoom: 12,
    }
  }

  // For lines, polygons, and other geometries, use bbox
  const bbox = createBboxFromGeometryString(geometryString)
  if (bbox) {
    return {
      bounds: bbox,
      fitBoundsOptions: { padding: 70 },
    }
  }
}

/** MapLibre `setFeatureState` needs `sourceLayer` for vector/PMTiles sources, not for GeoJSON sources. */
export function featureStateTargetForMapSource(
  mapData: MapData,
  source: string,
  target: { id: string | number } & Record<string, unknown>,
) {
  const config = Object.values(mapData.sources).find((s) => s.tildaUrl === source)
  if (config?.type === MapSourceType.geojson) {
    return { source, ...target }
  }
  return { source, sourceLayer: "default" as const, ...target }
}
