import { Subsection } from "@/db"
import { GeometryByGeometryType } from "@/src/server/shared/utils/geometrySchemas"
import { typeGeometry } from "@/src/server/shared/utils/typeGeometry"
import { GeometryTypeEnum } from "@prisma/client"

/**
 * Transforms a subsection by typing its geometry based on its type field.
 * Returns a discriminated union where the geometry type is narrowed based on the type field.
 *
 * Type assertion is safe: typeGeometry validates at runtime that the geometry matches the type field,
 * ensuring the discriminated union is correctly formed even though TypeScript can't verify this narrowing.
 */
export const typeSubsectionGeometry = <T extends Pick<Subsection, "geometry" | "type">>(
  subsection: T,
) => {
  const typedGeometry = typeGeometry(subsection.geometry, ["LINE", "POLYGON"])

  if (subsection.type === GeometryTypeEnum.LINE) {
    return {
      ...subsection,
      type: subsection.type as typeof GeometryTypeEnum.LINE,
      geometry: typedGeometry as GeometryByGeometryType<"LINE">,
    }
  }

  if (subsection.type === GeometryTypeEnum.POLYGON) {
    return {
      ...subsection,
      type: subsection.type as typeof GeometryTypeEnum.POLYGON,
      geometry: typedGeometry as GeometryByGeometryType<"POLYGON">,
    }
  }

  throw new Error(`Unsupported geometry type: ${subsection.type}`)
}
