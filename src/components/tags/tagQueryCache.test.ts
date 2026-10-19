import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"
import {
  tagsQueryOptions,
  tagsWithUsageCountQueryOptions,
} from "@/src/server/tags/tagsQueryOptions"
import { removeTagFromCache, setTagArchivedInCache } from "./tagQueryCache"

const projectSlug = "demo"

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

describe("tagQueryCache", () => {
  it("removes the deleted tag from every cached tag list", async () => {
    const queryClient = createQueryClient()
    const tagsKey = tagsQueryOptions({ projectSlug }).queryKey
    const withUsageKey = tagsWithUsageCountQueryOptions({
      projectSlug,
      includeArchived: true,
    }).queryKey
    queryClient.setQueryData(tagsKey, { tags: [{ id: 1 }, { id: 2 }] } as never)
    queryClient.setQueryData(withUsageKey, {
      tags: [
        { id: 1, usageCount: 0 },
        { id: 2, usageCount: 3 },
      ],
    } as never)

    await removeTagFromCache(queryClient, 1)

    expect(queryClient.getQueryData(tagsKey)).toEqual({ tags: [{ id: 2 }] })
    expect(queryClient.getQueryData(withUsageKey)).toEqual({ tags: [{ id: 2, usageCount: 3 }] })
  })

  it("updates the archive state of the tag in cached tag lists", async () => {
    const queryClient = createQueryClient()
    const withUsageKey = tagsWithUsageCountQueryOptions({
      projectSlug,
      includeArchived: true,
    }).queryKey
    const archivedAt = new Date("2026-10-19T10:00:00Z")
    queryClient.setQueryData(withUsageKey, {
      tags: [
        { id: 1, archivedAt: null },
        { id: 2, archivedAt: null },
      ],
    } as never)

    await setTagArchivedInCache(queryClient, 1, archivedAt)
    expect(queryClient.getQueryData(withUsageKey)).toEqual({
      tags: [
        { id: 1, archivedAt },
        { id: 2, archivedAt: null },
      ],
    })

    await setTagArchivedInCache(queryClient, 1, null)
    expect(queryClient.getQueryData(withUsageKey)).toEqual({
      tags: [
        { id: 1, archivedAt: null },
        { id: 2, archivedAt: null },
      ],
    })
  })
})
