import { Subsection } from "@/src/prisma/generated/browser"
import { GeometryTypeEnum } from "@/src/prisma/generated/browser"
import { GeometryByGeometryType } from "@/src/shared/geometry/geometrySchemas"
import { typeGeometry } from "@/src/shared/geometry/typeGeometry"

/**
 * Transforms a subsection by typing its geometry based on its type field.
 *
 * **Never throws.** A geometry that fails validation is bad stored data, not a programming error,
 * so it is passed through untouched rather than failing the whole query. That makes the returned
 * geometry optimistically typed: call `isRenderableGeometry` before handing it to a map helper.
 */
export const typeSubsectionGeometry = <T extends Pick<Subsection, "geometry" | "type">>(
  subsection: T,
) => {
  let typedGeometry: unknown = subsection.geometry
  try {
    typedGeometry = typeGeometry(subsection.geometry, ["LINE", "POLYGON"])
  } catch {
    // Keep the raw value; `isRenderableGeometry` is what decides whether it may be drawn.
  }

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

  // A subsection typed POINT has no map representation; hand it back as-is so the caller's
  // `isRenderableGeometry` check keeps it off the map.
  return {
    ...subsection,
    type: subsection.type as typeof GeometryTypeEnum.LINE,
    geometry: typedGeometry as GeometryByGeometryType<"LINE">,
  }
}
