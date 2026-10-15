// @vitest-environment jsdom

import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import type { UploadFilter } from "@/src/shared/uploads/searchSchemas"
import type { UploadTableUpload } from "./uploadTypes"
import { useFilteredUploads } from "./useFilteredUploads"

const filterState = vi.hoisted(() => ({ filter: undefined as UploadFilter | undefined }))

vi.mock("./useUploadFilters", () => ({
  useUploadFilters: () => ({ filter: filterState.filter, setFilter: vi.fn() }),
}))

const uploads = [
  {
    id: 1,
    title: "Plan Brücke",
    externalUrl: "https://example.test/plan.pdf",
    tags: [{ id: 1, title: "Brückenbauwerke" }],
  },
  {
    id: 2,
    title: "Foto Kreuzung",
    externalUrl: "https://example.test/foto.jpg",
    tags: [{ id: 2, title: "Baustelle 1" }],
  },
] as unknown as UploadTableUpload[]

function filteredIds() {
  return renderHook(() => useFilteredUploads(uploads)).result.current.map((u) => u.id)
}

describe("useFilteredUploads", () => {
  beforeEach(() => {
    filterState.filter = undefined
  })

  test("filters by tag title, ignoring case", () => {
    filterState.filter = { tag: "baustelle 1" }
    expect(filteredIds()).toEqual([2])
  })

  test("does not match tag titles in the search", () => {
    filterState.filter = { searchterm: "baustelle" }
    expect(filteredIds()).toEqual([])
  })

  test("combines search and tag", () => {
    filterState.filter = { searchterm: "plan", tag: "Brückenbauwerke" }
    expect(filteredIds()).toEqual([1])
  })
})
