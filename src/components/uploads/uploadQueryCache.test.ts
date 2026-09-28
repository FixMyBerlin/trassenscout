import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { uploadsQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"
import { uploadsWithSubsectionsQueryOptions } from "@/src/server/uploads/uploadsWithSubsectionsQueryOptions"
import { invalidateAfterUploadChange, markUploadDeletedInCache } from "./uploadQueryCache"

const projectSlug = "demo"

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

describe("uploadQueryCache", () => {
  it("invalidates the protocol entry detail and the document list used on that page", async () => {
    const queryClient = createQueryClient()
    const projectRecordKey = projectRecordQueryOptions({ projectSlug, id: 1 }).queryKey
    const uploadsWithSubsectionsKey = uploadsWithSubsectionsQueryOptions({
      projectSlug,
      where: { id: { in: [10] } },
    }).queryKey

    queryClient.setQueryData(projectRecordKey, { uploads: [{ id: 10 }] } as never)
    queryClient.setQueryData(uploadsWithSubsectionsKey, { uploads: [{ id: 10 }] } as never)

    await invalidateAfterUploadChange(queryClient, projectSlug)

    expect(queryClient.getQueryState(projectRecordKey)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(uploadsWithSubsectionsKey)?.isInvalidated).toBe(true)
  })

  it("removes the deleted document from upload and protocol-entry caches", async () => {
    const queryClient = createQueryClient()
    const uploadsKey = uploadsQueryOptions({ projectSlug }).queryKey
    const uploadsWithSubsectionsKey = uploadsWithSubsectionsQueryOptions({
      projectSlug,
      where: { id: { in: [10, 11] } },
    }).queryKey
    const projectRecordKey = projectRecordQueryOptions({ projectSlug, id: 1 }).queryKey

    queryClient.setQueryData(uploadsKey, [{ id: 10 }, { id: 11 }] as never)
    queryClient.setQueryData(uploadsWithSubsectionsKey, {
      uploads: [{ id: 10 }, { id: 11 }],
    } as never)
    queryClient.setQueryData(projectRecordKey, { uploads: [{ id: 10 }, { id: 11 }] } as never)

    await markUploadDeletedInCache(queryClient, projectSlug, 10)

    expect(queryClient.getQueryData(uploadsKey)).toEqual([{ id: 11 }])
    expect(queryClient.getQueryData(uploadsWithSubsectionsKey)).toEqual({ uploads: [{ id: 11 }] })
    expect(queryClient.getQueryData(projectRecordKey)).toEqual({ uploads: [{ id: 11 }] })
  })
})
