import { describe, expect, it } from "vitest"
import { createProjectRecordExtractionSchema } from "@/src/server/ai/projectRecordExtractionSchema"

describe("createProjectRecordExtractionSchema", () => {
  it("accepts valid topic ids from a dynamic enum", () => {
    const schema = createProjectRecordExtractionSchema({
      tags: [
        { id: 1, title: "Planung" },
        { id: 2, title: "Umwelt" },
      ],
    })

    const result = schema.safeParse({
      body: "Protokolltext",
      title: "Titel",
      date: "2026-06-05T10:00:00.000Z",
      topics: ["1", "2"],
    })

    expect(result.success).toBe(true)
  })

  it("rejects topic ids outside the dynamic enum", () => {
    const schema = createProjectRecordExtractionSchema({
      tags: [{ id: 1, title: "Planung" }],
    })

    const result = schema.safeParse({
      body: "Protokolltext",
      title: "Titel",
      date: null,
      topics: ["99"],
    })

    expect(result.success).toBe(false)
  })

  it("allows any string topic ids when no project topics exist", () => {
    const schema = createProjectRecordExtractionSchema({
      tags: [],
    })

    const result = schema.safeParse({
      body: "Protokolltext",
      title: "Titel",
      date: null,
      topics: ["custom"],
    })

    expect(result.success).toBe(true)
  })
})
