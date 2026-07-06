import { z } from "zod"
import { ProjectSchema } from "@/src/shared/projects/schemas"

export const GetProjectBySlugSchema = z.object({
  projectSlug: z.string(),
})

export const GetProjectsAdminSchema = z.object({})
export const CreateProjectSchema = ProjectSchema

const projectFeatureFlagKeys = [
  "exportEnabled",
  "aiEnabled",
  "landAcquisitionModuleEnabled",
  "showLogEntries",
  "evaluationsEnabled",
] as const

export type ProjectFeatureFlagKey = (typeof projectFeatureFlagKeys)[number]

export const UpdateProjectsFeatureFlagSchema = z.object({
  projectSlugs: z.array(z.string()).min(1),
  key: z.enum(projectFeatureFlagKeys),
  enabled: z.coerce.boolean(),
})
