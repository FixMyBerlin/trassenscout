import { useParam } from "@blitzjs/next"

export const useSlugs = () => {
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  // ./[subsectionSlug]/edit, ./[subsectionSlug]/new-subsubsection, ./[subsectionSlug]/[subsubsectionSlug]/edit,
  const subsectionSlugFromSlug = useParam("subsectionSlug", "string")
  const subsubsectionSlugFromSlug = useParam("subsubsectionSlug", "string")
  // ./[...subsectionPath] which handels the 'show' action for subsection and subsubsection
  const [subsectionSlugFromPath, subsubsectionSlugFromPath] =
    (useParam("subsectionPath") as string[]) || []

  const paths = {
    projectSlug,
    sectionSlug,
    subsectionSlug: subsectionSlugFromPath || subsectionSlugFromSlug,
    subsubsectionSlug: subsubsectionSlugFromPath || subsubsectionSlugFromSlug,
  }
  return paths
}
