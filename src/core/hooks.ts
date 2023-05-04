import { useParam } from "@blitzjs/next"

export const useSlugs = () => {
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const [subsectionSlug, subsubsectionSlug] = (useParam("subsectionPath") as string[]) || []
  return { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug }
}
