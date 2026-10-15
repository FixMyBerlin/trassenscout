// @vitest-environment jsdom

import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import type { Contact } from "@/src/server/contacts/types"
import type { ContactFilter } from "@/src/shared/contacts/searchSchemas"
import { useFilteredContacts } from "./useFilteredContacts"

const filterState = vi.hoisted(() => ({ filter: undefined as ContactFilter | undefined }))

vi.mock("./useContactFilters", () => ({
  useContactFilters: () => ({ filter: filterState.filter, setFilter: vi.fn() }),
}))

const contacts = [
  { id: 1, firstName: "Frank", lastName: "Röpke", tags: [{ id: 1, title: "Feuerwehr" }] },
  { id: 2, firstName: "Anna", lastName: "Feuerstein", tags: [] },
  { id: 3, firstName: "Ulrich", lastName: "Müller", tags: [{ id: 2, title: "Ampel" }] },
] as unknown as Contact[]

function filteredIds() {
  return renderHook(() => useFilteredContacts(contacts)).result.current.map((c) => c.id)
}

describe("useFilteredContacts", () => {
  beforeEach(() => {
    filterState.filter = undefined
  })

  test("filters by tag title, ignoring case", () => {
    filterState.filter = { tag: "feuerwehr" }
    expect(filteredIds()).toEqual([1])
  })

  test("does not match tag titles in the search", () => {
    filterState.filter = { searchterm: "feuerwehr" }
    expect(filteredIds()).toEqual([])
  })

  test("combines search and tag", () => {
    filterState.filter = { searchterm: "müller", tag: "Feuerwehr" }
    expect(filteredIds()).toEqual([])
  })
})
