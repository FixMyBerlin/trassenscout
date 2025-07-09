import { bbox, lineString, multiLineString, point, polygon } from "@turf/turf"

export type GeometryType = "point" | "lineString" | "multiLineString" | "polygon" | "unknown"

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

export const createGeoJSONFromString = (geometryString: string) => {
  const geometryType = detectGeometryType(geometryString)
  const parsedGeometry = JSON.parse(geometryString)

  switch (geometryType) {
    case "point":
      return point(parsedGeometry as [number, number])
    case "lineString":
      return lineString(parsedGeometry as [number, number][])
    case "multiLineString":
      return multiLineString(parsedGeometry as [number, number][][])
    case "polygon":
      return polygon([parsedGeometry as [number, number][]])
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
