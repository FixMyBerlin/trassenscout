import type { Geometry, LineString, MultiLineString } from "geojson"

type LineishCoordinates = LineString["coordinates"] | MultiLineString["coordinates"]

export function inferLineGeometryType(coordinates: LineishCoordinates) {
  const isMulti = Array.isArray((coordinates as any)?.[0]?.[0])
  return isMulti ? ("MultiLineString" as const) : ("LineString" as const)
}

export function toLineGeometry(coordinates: LineishCoordinates) {
  const type = inferLineGeometryType(coordinates)
  return type === "MultiLineString"
    ? ({ type, coordinates: coordinates as MultiLineString["coordinates"] } satisfies Extract<
        Geometry,
        { type: "MultiLineString" }
      >)
    : ({ type, coordinates: coordinates as LineString["coordinates"] } satisfies Extract<
        Geometry,
        { type: "LineString" }
      >)
}
