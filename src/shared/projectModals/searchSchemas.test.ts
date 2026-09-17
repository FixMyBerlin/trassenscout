import { describe, expect, test } from "vitest"
import {
  clearAllProjectModalSearch,
  parseProjectModalSearch,
} from "@/src/shared/projectModals/searchSchemas"

describe("parseProjectModalSearch", () => {
  test("coerces the ids a URL carries as strings", () => {
    const search = parseProjectModalSearch({
      modalProjectRecordId: "42",
      modalProjectRecordView: "detail",
    })

    expect(search.modalProjectRecordId).toBe(42)
    expect(search.modalProjectRecordView).toBe("detail")
  })

  test("keeps the project of an entry opened from outside its project", () => {
    const search = parseProjectModalSearch({
      modalProjectRecordId: "42",
      modalProjectRecordView: "detail",
      modalProjectSlug: "ohv-radverkehr",
    })

    expect(search.modalProjectSlug).toBe("ohv-radverkehr")
  })

  test("opens nothing when the id has no view", () => {
    const search = parseProjectModalSearch({ modalProjectRecordId: "42" })

    expect(search.modalProjectRecordId).toBeUndefined()
    expect(search.modalProjectRecordView).toBeUndefined()
  })

  test("opens nothing when two modals are asked for at once", () => {
    const search = parseProjectModalSearch({
      modalProjectRecordId: "42",
      modalProjectRecordView: "detail",
      modalContactId: "7",
      modalContactView: "detail",
    })

    expect(search.modalProjectRecordId).toBeUndefined()
    expect(search.modalContactId).toBeUndefined()
  })

  test("falls back instead of throwing on values a URL can always contain", () => {
    const search = parseProjectModalSearch({
      modalProjectRecordId: "nonsense",
      modalProjectRecordView: "detail",
    })

    expect(search.modalProjectRecordId).toBeUndefined()
  })

  test("reads a missing search as no modal", () => {
    expect(parseProjectModalSearch(undefined).modalProjectRecordView).toBeUndefined()
  })
})

describe("clearAllProjectModalSearch", () => {
  test("drops the project of the entry along with it, so closing leaves no scope behind", () => {
    // As wide as a search read off the router, where nothing is a literal.
    const search = clearAllProjectModalSearch<Record<string, unknown>>({
      projectSlug: "ohv-radverkehr",
      modalProjectRecordId: 42,
      modalProjectRecordView: "detail",
      modalProjectSlug: "ohv-radverkehr",
    })

    expect(search.modalProjectRecordId).toBeUndefined()
    expect(search.modalProjectSlug).toBeUndefined()
    expect(search.projectSlug).toBe("ohv-radverkehr")
  })
})
