import { detectGeometryType } from "@/src/app/beteiligung/_components/form/map/utils"

const toCommaString = (coords: [number, number][]) => {
  return coords.map((c) => toStringPair(c)).join(", ")
}

const toStringPair = (coords: [number, number]) => {
  return roundCoords(coords).join(" ")
}

const roundCoords = (coords: [number, number]) => {
  return [coords[0].toFixed(8), coords[1].toFixed(8)]
}

export const coordinatesToWkt = (coordinatesString: string) => {
  if (!coordinatesString) return

  try {
    const coordinates = JSON.parse(coordinatesString)
    const geometryType = detectGeometryType(coordinatesString)

    switch (geometryType) {
      case "point": {
        const pointCoordinates = coordinates as [number, number]
        return `POINT (${toStringPair(pointCoordinates)})`
      }

      case "lineString": {
        const lineStringCoordinates = coordinates as [number, number][]
        const wktString = toCommaString(lineStringCoordinates)
        return `LINESTRING (${wktString})`
      }

      case "multiLineString": {
        const multiLineStringCoordinates = coordinates as [number, number][][]
        const wktString = multiLineStringCoordinates
          .map((lineString) => `(${toCommaString(lineString)})`)
          .join(", ")
        return `MULTILINESTRING (${wktString})`
      }

      case "polygon": {
        const polygonCoordinates = coordinates as [number, number][]
        const wktString = toCommaString(polygonCoordinates)
        return `POLYGON ((${wktString}))`
      }

      default:
        console.error(`Unsupported geometry type: ${geometryType}`)
        return undefined
    }
  } catch (error) {
    console.error("Error parsing coordinates:", error)
    return undefined
  }
}
