import { describe, expect, it } from "vitest"
import { extractPlaceholders, replacePlaceholders } from "./placeholders"

describe("extractPlaceholders", () => {
  it("returns nothing for empty input", () => {
    expect(extractPlaceholders("")).toEqual([])
    expect(extractPlaceholders(null)).toEqual([])
    expect(extractPlaceholders(undefined)).toEqual([])
  })

  it("collects names, tolerates inner whitespace and deduplicates", () => {
    expect(
      extractPlaceholders("{{ antragsteller }} und {{ort}}, wieder {{antragsteller}}"),
    ).toEqual(["antragsteller", "ort"])
  })

  it("ignores malformed placeholders", () => {
    expect(extractPlaceholders("{einfach} {{mit-strich}} {{ }}")).toEqual([])
  })

  it("is not affected by a previous call (no shared regex state)", () => {
    const markdown = "{{a}} {{b}}"
    expect(extractPlaceholders(markdown)).toEqual(extractPlaceholders(markdown))
  })
})

describe("replacePlaceholders", () => {
  it("substitutes known values and stringifies numbers", () => {
    expect(replacePlaceholders("{{ort}}: {{kosten}} EUR", { ort: "Aachen", kosten: 1200 })).toBe(
      "Aachen: 1200 EUR",
    )
  })

  it("renders unknown, null and empty values as an empty string", () => {
    expect(replacePlaceholders("[{{fehlt}}][{{leer}}][{{nix}}]", { leer: "", nix: null })).toBe(
      "[][][]",
    )
  })

  it("replaces every occurrence", () => {
    expect(replacePlaceholders("{{x}}-{{x}}-{{x}}", { x: "1" })).toBe("1-1-1")
  })

  it("leaves surrounding markdown untouched", () => {
    expect(replacePlaceholders("| **{{a}}** | {{b}} |", { a: "A", b: "B" })).toBe("| **A** | B |")
  })
})
