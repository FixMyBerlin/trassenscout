import { detectGeometryType } from "@/src/app/beteiligung/_components/form/map/utils"

export const coordinatesToWkt = (coordinatesString: string) => {
  if (!coordinatesString) return

  try {
    const coordinates = JSON.parse(coordinatesString)
    const geometryType = detectGeometryType(coordinatesString)

    switch (geometryType) {
      case "point": {
        const pointCoordinates = coordinates as [number, number]
        return `POINT (${pointCoordinates.join(" ")})`
      }

      case "lineString": {
        const lineStringCoordinates = coordinates as [number, number][]
        const wktString = lineStringCoordinates.map((coord) => coord.join(" ")).join(", ")
        return `LINESTRING (${wktString})`
      }

      case "multiLineString": {
        const multiLineStringCoordinates = coordinates as [number, number][][]
        const wktString = multiLineStringCoordinates
          .map((lineString) => `(${lineString.map((coord) => coord.join(" ")).join(", ")})`)
          .join(", ")
        return `MULTILINESTRING (${wktString})`
      }

      case "polygon": {
        const polygonCoordinates = coordinates as [number, number][]
        const wktString = polygonCoordinates.map((coord) => coord.join(" ")).join(", ")
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
