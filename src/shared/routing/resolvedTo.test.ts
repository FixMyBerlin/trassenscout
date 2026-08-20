import { describe, expect, it } from "vitest"
import { splitResolvedTo } from "./resolvedTo"

describe("splitResolvedTo", () => {
  it("leaves a plain path untouched", () => {
    expect(splitResolvedTo("/rs23/abschnitte")).toEqual({
      to: "/rs23/abschnitte",
      search: undefined,
      hash: undefined,
    })
  })

  it("separates the query into structured search", () => {
    expect(splitResolvedTo("/rs23?modalProjectRecordId=5&modalProjectRecordView=detail")).toEqual({
      to: "/rs23",
      search: { modalProjectRecordId: 5, modalProjectRecordView: "detail" },
      hash: undefined,
    })
  })

  it("separates the hash", () => {
    expect(splitResolvedTo("/rs23/project-records#filter")).toEqual({
      to: "/rs23/project-records",
      search: undefined,
      hash: "filter",
    })
  })

  it("separates query and hash together", () => {
    const result = splitResolvedTo("/rs23/project-records?page=2#filter")
    expect(result.to).toBe("/rs23/project-records")
    expect(result.search).toEqual({ page: 2 })
    expect(result.hash).toBe("filter")
  })

  it("round-trips the app's JSON search encoding", () => {
    const result = splitResolvedTo('/rs23/project-records?filter={"tags":[1,2]}')
    expect(result.search).toEqual({ filter: { tags: [1, 2] } })
  })

  it("keeps search undefined for an empty query so the route's middlewares still apply", () => {
    expect(splitResolvedTo("/rs23?").search).toBeUndefined()
  })

  it("keeps hash undefined for a trailing hash marker", () => {
    expect(splitResolvedTo("/rs23#").hash).toBeUndefined()
  })

  it("does not treat a hash inside the query as a path hash", () => {
    const result = splitResolvedTo("/rs23?a=1#b=2")
    expect(result.to).toBe("/rs23")
    expect(result.search).toEqual({ a: 1 })
    expect(result.hash).toBe("b=2")
  })
})
