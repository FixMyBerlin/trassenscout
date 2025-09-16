import getProtocols from "@/src/server/protocols/queries/getProtocols"
import { useFilters } from "./useFilters.nuqs"

export const useFilteredProtocols = (protocols: Awaited<ReturnType<typeof getProtocols>>) => {
  const { filter } = useFilters()

  if (!filter || !filter.searchterm) return protocols

  const { searchterm } = filter

  const filtered = protocols.filter((protocol) => {
    if (!searchterm) return protocol

    // Remove hashtags from search term and trim any remaining whitespace
    const cleanedSearchterm = searchterm.trim().toLowerCase().replace(/#/g, "").trim()

    return (
      protocol.title?.toLowerCase().includes(cleanedSearchterm) ||
      protocol.body?.toLowerCase().includes(cleanedSearchterm) ||
      protocol.protocolTopics.some((topic) =>
        topic.title.toLowerCase().includes(cleanedSearchterm),
      ) ||
      protocol.subsection?.slug.toLowerCase().includes(cleanedSearchterm)
    )
  })

  return filtered
}
