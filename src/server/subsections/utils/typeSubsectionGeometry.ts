import { Subsection } from "@/db"
import { LineStringGeometrySchema } from "@/src/core/utils/geojson-schemas"

/**
 * Validates and types a subsection's geometry JSON field using Zod to be LineStringGeometrySchema
 */
export const typeSubsectionGeometry = <T extends Pick<Subsection, "geometry">>(
  subsection: T,
): Omit<T, "geometry"> & { geometry: ReturnType<typeof LineStringGeometrySchema.parse> } => {
  const parsedGeometry = LineStringGeometrySchema.parse(subsection.geometry)
  return {
    ...subsection,
    geometry: parsedGeometry,
  }
}
