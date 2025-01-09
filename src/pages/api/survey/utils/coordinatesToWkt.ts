// atm we only support LineString and MultiLineString
export const coordinatesToWkt = ({
  coordinates,
  type,
}: {
  coordinates: number[][] | number[][][] | undefined
  type: "line" | "polygon"
}) => {
  if (!coordinates) return
  // Check if the input (shape) is a MultiLineString / Polygon
  if (Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0])) {
    const multiLineStringOrPolygonCoordinates = coordinates as number[][][]
    const wktString = multiLineStringOrPolygonCoordinates
      .map((lineString) => `(${lineString.map((coord) => coord.join(" ")).join(", ")})`)
      .join(", ")
    // check in configuration if the geometry is a polygon or a type line
    return type === "polygon" ? `POLYGON (${wktString})` : `MULTILINESTRING (${wktString})`
  }
  const lineStringCoordinates = coordinates as number[][]
  const wktString = lineStringCoordinates.map((coord) => coord.join(" ")).join(", ")
  return `LINESTRING (${wktString})`
}
