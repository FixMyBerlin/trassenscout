import type { QueryClient } from "@tanstack/react-query"

type CachedTagList = { tags: Array<{ id: number; archivedAt?: Date | string | null }> }

async function updateCachedTagLists(
  queryClient: QueryClient,
  update: (tags: CachedTagList["tags"]) => CachedTagList["tags"],
) {
  await queryClient.cancelQueries({ queryKey: ["tags"] })
  queryClient.setQueriesData<CachedTagList>({ queryKey: ["tags"] }, (data) =>
    data && Array.isArray(data.tags) ? { ...data, tags: update(data.tags) } : data,
  )
}

export function removeTagFromCache(queryClient: QueryClient, tagId: number) {
  return updateCachedTagLists(queryClient, (tags) => tags.filter((tag) => tag.id !== tagId))
}

export function setTagArchivedInCache(
  queryClient: QueryClient,
  tagId: number,
  archivedAt: Date | string | null,
) {
  return updateCachedTagLists(queryClient, (tags) =>
    tags.map((tag) => (tag.id === tagId ? { ...tag, archivedAt } : tag)),
  )
}
