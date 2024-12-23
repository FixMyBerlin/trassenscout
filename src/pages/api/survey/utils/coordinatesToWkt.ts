// atm we only support LineString and MultiLineString
export const coordinatesToWkt = ({
  coordinates,
  type,
}: {
  coordinates: number[][] | number[][][] | undefined
  type: "line" | "polygon"
}) => {
  if (!coordinates) return
  // Check if the input is a MultiLineString
  if (Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0])) {
    const multiLineStringCoordinates = coordinates as number[][][]
    const wktMultiLineString = multiLineStringCoordinates
      .map((lineString) => `(${lineString.map((coord) => coord.join(" ")).join(", ")})`)
      .join(", ")
    return `MULTILINESTRING (${wktMultiLineString})`
  }

  const lineStringOrPolygonCoordinates = coordinates as number[][]
  const wktString = lineStringOrPolygonCoordinates.map((coord) => coord.join(" ")).join(", ")
  return type === "line" ? `LINESTRING (${wktString})` : `POLYGON ((${wktString}))`
}
