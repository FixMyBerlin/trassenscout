export const mapGeoTypeToEnum = (geometryType: string) => {
  if (geometryType === "Point" || geometryType === "MultiPoint") return "POINT"
  if (geometryType === "LineString" || geometryType === "MultiLineString") return "LINE"
  if (geometryType === "Polygon" || geometryType === "MultiPolygon") return "POLYGON"
  return "LINE" // fallback
}
