import { z } from "zod"
import { ProjectRecordEmailSchema } from "@/src/shared/projectRecordEmails/schemas"

export const GetProjectRecordEmailsSchema = z.object({
  projectId: z.number().optional(),
})

export const GetProjectRecordEmailSchema = z.object({ id: z.number() })

export const CreateProjectRecordEmailSchema = ProjectRecordEmailSchema

export const ProcessProjectRecordEmailSchema = z.object({
  projectRecordEmailId: z.number(),
})
