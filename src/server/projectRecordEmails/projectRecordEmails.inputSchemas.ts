import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { ProjectRecordEmailSchema } from "@/src/shared/projectRecordEmails/schemas"
import { NewProjectRecordFormSchema } from "@/src/shared/projectRecords/schemas"

export const GetProjectRecordEmailsSchema = z.object({
  projectId: z.number().optional(),
})

export const GetProjectRecordEmailSchema = z.object({ id: z.number() })

export const CreateProjectRecordEmailSchema = ProjectRecordEmailSchema

export const ProjectRecordEmailInboxItemSchema = ProjectSlugRequiredSchema.extend({
  projectRecordEmailId: z.number().int().positive(),
})

export const DraftProjectRecordFromEmailSchema = ProjectRecordEmailInboxItemSchema.extend({
  projectRecordTemplateId: z.number().int().positive().nullable(),
})

export const CreateProjectRecordFromEmailSchema = ProjectRecordEmailInboxItemSchema.and(
  NewProjectRecordFormSchema,
)
