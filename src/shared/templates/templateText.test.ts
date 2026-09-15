import { describe, expect, it } from "vitest"
import { toTemplateText } from "./templateText"

const maxLength = 1000

describe("toTemplateText", () => {
  it("returns an empty string for empty input", () => {
    expect(toTemplateText("")).toBe("")
    expect(toTemplateText(null)).toBe("")
    expect(toTemplateText(undefined)).toBe("")
  })

  it("keeps markdown and line breaks but trims the outer whitespace", () => {
    expect(toTemplateText("\n# Titel\n\n- Punkt eins\n")).toBe("# Titel\n\n- Punkt eins")
  })

  it("strips HTML tags", () => {
    expect(toTemplateText('Hinweis <script>alert("x")</script> Ende')).toBe(
      'Hinweis alert("x") Ende',
    )
  })

  it("keeps text up to the limit unchanged", () => {
    const text = "a".repeat(maxLength)
    expect(toTemplateText(text)).toBe(text)
  })

  it("truncates longer text at the last word boundary", () => {
    const result = toTemplateText(`${"wort ".repeat(maxLength)}ende`)

    expect(result.endsWith("wort…")).toBe(true)
    expect(result.length).toBeLessThanOrEqual(maxLength + 1)
  })

  it("falls back to a hard cut when a single word exceeds the limit", () => {
    expect(toTemplateText("a".repeat(maxLength * 2))).toBe(`${"a".repeat(maxLength)}…`)
  })
})
