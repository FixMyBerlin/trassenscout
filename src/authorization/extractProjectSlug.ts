import { z } from "zod"

export const ProjectSlugRequiredSchema = z.object({
  // We use useProjectSlug which makes sure this is never undefined.
  projectSlug: z.string(),
})

const ProjectSlugSchema = z.object({ projectSlug: z.string() }).passthrough()
export type ProjectSlugType = z.infer<typeof ProjectSlugSchema>

export const extractProjectSlug = (input: any) => {
  // This makes sure every request has a `projectSlug` or explodes.
  // This will make sure we find errors early, eg. wenn we are logged in as admin and exit the `authorizeProjectMember` early
  const { projectSlug } = ProjectSlugSchema.parse(input)
  return projectSlug
}
