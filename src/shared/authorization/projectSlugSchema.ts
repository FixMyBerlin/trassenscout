import { z } from "zod"

export const ProjectSlugRequiredSchema = z.object({
  // Callers under `/_loggedInProjects/$projectSlug` pass `projectSlug` from route params.
  projectSlug: z.string(),
})
