import { GeometryTypeEnum } from "@/src/prisma/generated/client"
import {
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  MultiPointGeometrySchema,
  MultiPolygonGeometrySchema,
  PointGeometrySchema,
  PolygonGeometrySchema,
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
    return roundGeometryCoordinates(MultiPolygonGeometrySchema.parse(geometry))
  }

  throw new Error(`Geometry does not match any allowed type: ${allowedTypes.join(", ")}`)
}
