import { useParam } from "@blitzjs/next"

export const useSlugs = () => {
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const subsectionSlug = useParam("subsectionSlug", "string")
  const subsubsectionSlug = useParam("subsubsectionSlug", "string")

  const paths = {
    projectSlug,
    sectionSlug,
    subsectionSlug,
    subsubsectionSlug,
  }
  return paths
}
