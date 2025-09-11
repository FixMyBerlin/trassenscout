import getProtocols from "@/src/server/protocols/queries/getProtocols"
import { useFilters } from "./useFilters.nuqs"

export const useFilteredProtocols = (protocols: Awaited<ReturnType<typeof getProtocols>>) => {
  const { filter } = useFilters()

  if (!filter || !filter.searchterm) return protocols

  const { searchterm } = filter

  const filtered = protocols.filter((protocol) => {
    if (!searchterm) return protocol
    return (
      protocol.title?.toLowerCase().includes(searchterm.trim().toLowerCase()) ||
      protocol.body?.toLowerCase().includes(searchterm.trim().toLowerCase()) ||
      protocol.protocolTopics.some((topic) =>
        topic.title.toLowerCase().includes(searchterm.trim().toLowerCase()),
      ) ||
      protocol.subsection?.slug.toLowerCase().includes(searchterm.trim().toLowerCase())
    )
  })

  return filtered
}
