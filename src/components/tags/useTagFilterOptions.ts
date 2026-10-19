import { useQuery } from "@tanstack/react-query"
import { tagsQueryOptions } from "@/src/server/tags/tagsQueryOptions"
import { getTagFilterOptions } from "./tagFilterOptions"

/** All active tags of the project plus every (also archived) tag shown on an entry. */
export function useTagFilterOptions(
  entries: { tags: { title: string }[] }[],
  projectSlug: string | undefined,
) {
  const { data } = useQuery({
    ...tagsQueryOptions({ projectSlug: projectSlug ?? "" }),
    enabled: Boolean(projectSlug),
  })

  return getTagFilterOptions([...entries, { tags: data?.tags ?? [] }])
}
