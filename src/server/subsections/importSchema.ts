import { SubsectionBaseSchema } from "@/src/server/subsections/schema"
import { z } from "zod"

// Shared schema for import data - used by both CSV script validation and API route
export const ImportSubsectionDataSchema = SubsectionBaseSchema.omit({ projectId: true })
  .extend({
    geometry: SubsectionBaseSchema.shape.geometry.optional(),
    type: SubsectionBaseSchema.shape.type.optional(),
    order: z.coerce.number().optional(),
  })
