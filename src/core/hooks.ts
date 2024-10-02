import { useParam } from "@blitzjs/next"

export const useSlugs = () => {
  const subsectionSlug = useParam("subsectionSlug", "string")
  const subsubsectionSlug = useParam("subsubsectionSlug", "string")

  const paths = {
    subsectionSlug,
    subsubsectionSlug,
  }
  return paths
}

export const useProjectSlug = () => {
  return useParam("projectSlug", "string")!
}
