// atm we only support LineString and MultiLineString
export const coordinatesToWkt = (coordinates: number[][] | number[][][]) => {
  // Check if the input is a MultiLineString
  if (Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0])) {
    const multiLineStringCoordinates = coordinates as number[][][]
    const wktMultiLineString = multiLineStringCoordinates
      .map((lineString) => `(${lineString.map((coord) => coord.join(" ")).join(", ")})`)
      .join(", ")
    return `MULTILINESTRING (${wktMultiLineString})`
  }

  const lineStringCoordinates = coordinates as number[][]
  const wktLineString = lineStringCoordinates.map((coord) => coord.join(" ")).join(", ")
  return `LINESTRING (${wktLineString})`
}
