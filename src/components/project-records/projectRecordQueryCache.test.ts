import { QueryClient } from "@tanstack/react-query"
import { describe, expect, test } from "vitest"
import {
  invalidateAfterProjectRecordChange,
  invalidateAfterProjectRecordPatch,
} from "./projectRecordQueryCache"

describe("invalidateAfterProjectRecordChange", () => {
  test("marks the record lists and the cached documents stale, but not the record itself", async () => {
    const queryClient = new QueryClient()
    const keys = {
      list: ["projectRecords", { projectSlug: "ohv" }],
      assignedToMe: ["projectRecords", "assignedToMe", { projectSlug: "ohv" }],
      tabCounts: ["projectRecordsTabCounts", { projectSlug: "ohv" }],
      bySubsubsection: ["projectRecordsBySubsubsection", { projectSlug: "ohv" }],
      documentDetail: ["upload", { projectSlug: "ohv", id: 615 }],
      record: ["projectRecord", { projectSlug: "ohv", id: 272 }],
    }
    for (const queryKey of Object.values(keys)) queryClient.setQueryData(queryKey, {})

    await invalidateAfterProjectRecordChange(queryClient, "ohv")

    const isInvalidated = (queryKey: unknown[]) =>
      queryClient.getQueryState(queryKey)?.isInvalidated
    expect(isInvalidated(keys.list)).toBe(true)
    expect(isInvalidated(keys.assignedToMe)).toBe(true)
    expect(isInvalidated(keys.tabCounts)).toBe(true)
    expect(isInvalidated(keys.bySubsubsection)).toBe(true)
    // Cached forever by `uploadQueryOptions`: only an invalidation refreshes its links.
    expect(isInvalidated(keys.documentDetail)).toBe(true)
    // Still on screen after a delete until the navigation; refetching it would show a not-found.
    expect(isInvalidated(keys.record)).toBe(false)
  })
})

describe("invalidateAfterProjectRecordPatch", () => {
  test("marks the record and every record list stale, but not the documents", async () => {
    const queryClient = new QueryClient()
    const keys = {
      record: ["projectRecord", { projectSlug: "ohv", id: 272 }],
      otherRecord: ["projectRecord", { projectSlug: "ohv", id: 273 }],
      list: ["projectRecords", { projectSlug: "ohv" }],
      assignedToMe: ["projectRecords", "assignedToMe", { projectSlug: "ohv" }],
      bySubsubsection: ["projectRecordsBySubsubsection", { projectSlug: "ohv" }],
      documentDetail: ["upload", { projectSlug: "ohv", id: 615 }],
    }
    for (const queryKey of Object.values(keys)) queryClient.setQueryData(queryKey, {})

    await invalidateAfterProjectRecordPatch(queryClient, { projectSlug: "ohv", id: 272 })

    const isInvalidated = (queryKey: unknown[]) =>
      queryClient.getQueryState(queryKey)?.isInvalidated
    expect(isInvalidated(keys.record)).toBe(true)
    expect(isInvalidated(keys.otherRecord)).toBe(false)
    expect(isInvalidated(keys.list)).toBe(true)
    expect(isInvalidated(keys.assignedToMe)).toBe(true)
    expect(isInvalidated(keys.bySubsubsection)).toBe(true)
    expect(isInvalidated(keys.documentDetail)).toBe(false)
  })
})
