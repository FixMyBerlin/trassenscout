import { z } from "zod"
import { ProjectSchema } from "@/src/shared/projects/schemas"

export const GetProjectBySlugSchema = z.object({
  projectSlug: z.string(),
})

export const GetProjectsAdminSchema = z.object({})
export const CreateProjectSchema = ProjectSchema
export const UpdateProjectShowLogEntriesSchema = z.object({
  showLogEntries: z.coerce.boolean(),
  projectSlug: z.string(),
})
export const UpdateProjectAiEnabledSchema = z.object({
  aiEnabled: z.coerce.boolean(),
  projectSlug: z.string(),
})
export const UpdateProjectLandAcquisitionModuleEnabledSchema = z.object({
  landAcquisitionModuleEnabled: z.coerce.boolean(),
  projectSlug: z.string(),
})
export const UpdateProjectEvaluationsEnabledSchema = z.object({
  evaluationsEnabled: z.coerce.boolean(),
  projectSlug: z.string(),
})
export const UpdateProjectExportApiSchema = z.object({
  exportEnabled: z.coerce.boolean(),
  projectSlug: z.string(),
})
