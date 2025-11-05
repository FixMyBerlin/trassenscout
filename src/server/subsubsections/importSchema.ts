import { SubsubsectionBaseSchema } from "@/src/server/subsubsections/schema"
import { z } from "zod"

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
    geometry: SubsubsectionBaseSchema.shape.geometry.optional(),
    type: SubsubsectionBaseSchema.shape.type.optional(),
  })
