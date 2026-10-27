import { z } from "zod"
import {
  SubsectionGeometryWithTypeSchema,
  SubsubsectionGeometryWithTypeSchema,
} from "@/src/shared/geometry/geometrySchemas"

/**
 * Validation refinement for subsections
 * Only allows LINE and POLYGON types (not POINT)
 */
export const subsectionGeometryTypeValidationRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema.and(SubsectionGeometryWithTypeSchema)

/**
 * Validation refinement for subsubsections
 * Allows POINT, LINE, and POLYGON types, or no geometry at all (both null)
 */
export const subsubsectionGeometryTypeValidationRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema.and(SubsubsectionGeometryWithTypeSchema)
