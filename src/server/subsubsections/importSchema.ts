import { z } from "zod"
import { GeometryTypeEnum } from "@/src/prisma/generated/browser"
import { SupportedGeometrySchema } from "@/src/shared/geometry/geometrySchemas"
import { SubsubsectionBaseSchema } from "@/src/shared/subsubsections/schemas"

// Shared schema for import data - used by both CSV script validation and API route
export const ImportSubsubsectionDataSchema = SubsubsectionBaseSchema.omit({ subsectionId: true })
  .extend({
    // Allow slug fields in addition to ID fields
    qualityLevelSlug: z.string().optional(),
    subsubsectionStatusSlug: z.string().optional(),
    subsubsectionInfraSlug: z.string().optional(),
    subsubsectionTaskSlug: z.string().optional(),
  })
  .extend({
    // Allow geometry and type to be optional for imports
    // Type is inferred from geometry in CSV script, so only set when geometry is provided
    // Not nullable: imports never create Maßnahmen without geometry
    geometry: SupportedGeometrySchema.optional(),
    type: z.enum(GeometryTypeEnum).optional(),
  })
