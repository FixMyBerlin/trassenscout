import { describe, expect, it } from "vitest"
import {
  getRemovedDefinitionNames,
  parseDefinitions,
  parseExtraFields,
  sanitizeExtraFieldsForSave,
  sortByOrder,
} from "@/src/shared/subsubsections/extraFieldSchemas"

describe("extraFieldSchemas", () => {
  it("parses and sorts definitions", () => {
    const definitions = parseDefinitions([
      { name: "b", label: "B", order: 1 },
      { name: "a", label: "A", order: 0 },
    ])

    expect(definitions).toEqual([
      { name: "a", label: "A", order: 0 },
      { name: "b", label: "B", order: 1 },
    ])
    expect(sortByOrder(definitions)).toEqual(definitions)
  })

  it("drops empty extra field values without trimming stored strings", () => {
    expect(parseExtraFields({ note: " hello ", empty: "" })).toEqual({ note: " hello " })
  })

  it("sanitizes unknown keys and empty values on save", () => {
    const definitions = [{ name: "note", label: "Note", order: 0 }]
    expect(
      sanitizeExtraFieldsForSave({ note: " ok ", other: "x", blank: "" }, definitions),
    ).toEqual({ note: "ok" })
  })

  it("detects removed definition names", () => {
    const previous = [
      { name: "a", label: "A", order: 0 },
      { name: "b", label: "B", order: 1 },
    ]
    const next = [{ name: "a", label: "A renamed", order: 0 }]

    expect(getRemovedDefinitionNames(previous, next)).toEqual(["b"])
  })
})
