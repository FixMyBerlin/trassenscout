import { GeometryTypeEnum } from "@/src/prisma/generated/browser"
import {
  LineLikeGeometrySchema,
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  MultiPointGeometrySchema,
  MultiPolygonGeometrySchema,
  PointGeometrySchema,
  PointLikeGeometrySchema,
  PolygonGeometrySchema,
  PolygonLikeGeometrySchema,
} from "@/src/shared/geometry/geojsonSchemas"
import { roundGeometryCoordinates } from "@/src/shared/geometry/roundGeometryCoordinates"

export const typeGeometry = (geometry: unknown, allowedTypes: GeometryTypeEnum[]) => {
  // Try parsing each allowed geometry type in order (single variant first, then Multi variant)
  if (allowedTypes.includes("POINT")) {
    const pointResult = PointGeometrySchema.safeParse(geometry)
    if (pointResult.success) {
      return roundGeometryCoordinates(pointResult.data)
    }
    const multiPointResult = MultiPointGeometrySchema.safeParse(geometry)
    if (multiPointResult.success) {
      return roundGeometryCoordinates(multiPointResult.data)
    }
  }

  if (allowedTypes.includes("LINE")) {
    const lineResult = LineStringGeometrySchema.safeParse(geometry)
    if (lineResult.success) {
      return roundGeometryCoordinates(lineResult.data)
    }
    const multiLineResult = MultiLineStringGeometrySchema.safeParse(geometry)
    if (multiLineResult.success) {
      return roundGeometryCoordinates(multiLineResult.data)
    }
  }

  if (allowedTypes.includes("POLYGON")) {
    const polygonResult = PolygonGeometrySchema.safeParse(geometry)
    if (polygonResult.success) {
      return roundGeometryCoordinates(polygonResult.data)
    }
    const multiPolygonResult = MultiPolygonGeometrySchema.safeParse(geometry)
    if (multiPolygonResult.success) {
      return roundGeometryCoordinates(multiPolygonResult.data)
    }
  }

  // Nothing matched. Report against the family the geometry itself claims via its `type`, so the
  // logged error names the real defect ("ring is not closed") instead of whichever variant
  // happened to be tried last ("expected MultiPolygon").
  const declaredType = (geometry as { type?: unknown } | null | undefined)?.type
  if (
    allowedTypes.includes("POINT") &&
    (declaredType === "Point" || declaredType === "MultiPoint")
  ) {
    return roundGeometryCoordinates(PointLikeGeometrySchema.parse(geometry))
  }
  if (
    allowedTypes.includes("LINE") &&
    (declaredType === "LineString" || declaredType === "MultiLineString")
  ) {
    return roundGeometryCoordinates(LineLikeGeometrySchema.parse(geometry))
  }
  if (
    allowedTypes.includes("POLYGON") &&
    (declaredType === "Polygon" || declaredType === "MultiPolygon")
  ) {
    return roundGeometryCoordinates(PolygonLikeGeometrySchema.parse(geometry))
  }

  throw new Error(
    `Geometry of type ${JSON.stringify(declaredType)} does not match any allowed type: ${allowedTypes.join(", ")}`,
  )
}
