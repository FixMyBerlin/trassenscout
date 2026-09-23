// @vitest-environment jsdom

import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import type { ProjectRecordsList } from "@/src/server/projectRecords/types"
import type { ProjectRecordFilter } from "@/src/shared/projectRecords/searchSchemas"
import { useFilteredProjectRecords } from "./useFilteredProjectRecords"

const filterState = vi.hoisted(() => ({
  filter: undefined as ProjectRecordFilter | undefined,
  userId: undefined as number | undefined,
}))

vi.mock("../useProjectRecordFilters", () => ({
  useProjectRecordFilters: () => ({
    filter: filterState.filter,
    setFilter: vi.fn(),
  }),
}))

vi.mock("@/src/components/user/useCurrentUser", () => ({
  useCurrentUser: () => (filterState.userId == null ? null : { id: filterState.userId }),
}))

const records = [
  {
    id: 1,
    title: "Offen an mich",
    body: "",
    editingState: "PENDING",
    assignedToId: 7,
    assignedById: 3,
    tags: [],
    assignedTo: null,
  },
  {
    id: 2,
    title: "Fertig von mir",
    body: "",
    editingState: "COMPLETED",
    assignedToId: 4,
    assignedById: 7,
    tags: [],
    assignedTo: null,
  },
] as unknown as ProjectRecordsList

function filteredIds() {
  return renderHook(() => useFilteredProjectRecords(records)).result.current.map(
    (record) => record.id,
  )
}

describe("useFilteredProjectRecords", () => {
  beforeEach(() => {
    filterState.filter = undefined
    filterState.userId = 7
  })

  test("returns every record when no filter is set", () => {
    expect(filteredIds()).toEqual([1, 2])
  })

  test("filters by editing state", () => {
    filterState.filter = { searchterm: "", status: "COMPLETED", direction: "all" }
    expect(filteredIds()).toEqual([2])
  })

  test("filters assignments to the current user", () => {
    filterState.filter = { searchterm: "", status: "all", direction: "toMe" }
    expect(filteredIds()).toEqual([1])
  })

  test("filters assignments made by the current user", () => {
    filterState.filter = { searchterm: "", status: "all", direction: "byMe" }
    expect(filteredIds()).toEqual([2])
  })

  test("keeps the list while the current user is still loading", () => {
    filterState.userId = undefined
    filterState.filter = { searchterm: "", status: "PENDING", direction: "toMe" }
    expect(filteredIds()).toEqual([1])
  })
})
