import { z } from "zod"
import {
  GeometryWithTypeSchema,
  SubsectionGeometryWithTypeSchema,
} from "@/src/shared/geometry/geometrySchemas"

/**
 * Shared refinement function for geometry type validation
 * Validates that geometry type matches enum type via discriminated union.
 */
export const geometryTypeValidationRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema.and(GeometryWithTypeSchema)

/**
 * Validation refinement for subsections
 * Only allows LINE and POLYGON types (not POINT)
 */
export const subsectionGeometryTypeValidationRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema.and(SubsectionGeometryWithTypeSchema)

/**
 * Validation refinement for subsubsections
 * Allows POINT, LINE, and POLYGON types
 */
export const subsubsectionGeometryTypeValidationRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema.and(GeometryWithTypeSchema)
