import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

const lookupTableValues = [
  "acquisitionAreaStatuses",
  "networkHierarchies",
  "operators",
  "tags",
  "qualityLevels",
  "subsectionStatuses",
  "subsubsectionInfras",
  "subsubsectionInfrastructureTypes",
  "subsubsectionSpecials",
  "subsubsectionStatuses",
  "subsubsectionTasks",
  "surveyResponseTags",
] as const

export const LookupTableSchema = z.enum(lookupTableValues)
export const GetLookupRowsSchema = ProjectSlugRequiredSchema.extend({ table: LookupTableSchema })
export const GetLookupRowSchema = GetLookupRowsSchema.extend({ id: z.number() })
export const CreateLookupRowSchema = GetLookupRowsSchema.extend({ data: z.unknown() })
export const UpdateLookupRowSchema = GetLookupRowSchema.extend({ data: z.unknown() })
export const DeleteLookupRowSchema = GetLookupRowSchema

export type GetLookupRowsInput = z.infer<typeof GetLookupRowsSchema>
export type GetLookupRowInput = z.infer<typeof GetLookupRowSchema>
