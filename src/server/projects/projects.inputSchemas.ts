import { z } from "zod"
import { McpModeEnum } from "@/src/prisma/generated/browser"
import { ProjectSchema } from "@/src/shared/projects/schemas"

export const GetProjectBySlugSchema = z.object({
  projectSlug: z.string(),
})

export const GetProjectsAdminSchema = z.object({})
export const CreateProjectSchema = ProjectSchema.omit({ projectLeadId: true })

const projectFeatureFlagKeys = [
  "exportEnabled",
  "aiEnabled",
  "assignmentRepliesEnabled",
  "landAcquisitionModuleEnabled",
  "showLogEntries",
  "evaluationsEnabled",
  "externalShareEnabled",
] as const

export type ProjectFeatureFlagKey = (typeof projectFeatureFlagKeys)[number]

export const UpdateProjectsFeatureFlagSchema = z.object({
  projectSlugs: z.array(z.string()).min(1),
  key: z.enum(projectFeatureFlagKeys),
  enabled: z.coerce.boolean(),
})

export const UpdateProjectMcpModeSchema = z.object({
  projectSlug: z.string(),
  mcpMode: z.enum(McpModeEnum),
})
