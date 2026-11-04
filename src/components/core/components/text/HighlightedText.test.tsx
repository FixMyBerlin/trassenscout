// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"
import { HighlightedText } from "./HighlightedText"

function renderHighlight(text: string, searchterm: string | undefined) {
  const { container } = render(
    <p>
      <HighlightedText text={text} searchterm={searchterm} />
    </p>,
  )
  return {
    text: container.textContent,
    marks: [...container.querySelectorAll("mark")].map((mark) => mark.textContent),
  }
}

describe("HighlightedText", () => {
  afterEach(cleanup)

  test("marks every match and keeps the original casing", () => {
    expect(renderHighlight("Radweg und radweg", "RADWEG")).toEqual({
      text: "Radweg und radweg",
      marks: ["Radweg", "radweg"],
    })
  })

  test("leaves the text alone without a searchterm", () => {
    expect(renderHighlight("Radweg", "  ")).toEqual({ text: "Radweg", marks: [] })
    expect(renderHighlight("Radweg", undefined)).toEqual({ text: "Radweg", marks: [] })
  })

  test("treats regular expression characters as plain text", () => {
    expect(renderHighlight("Kosten (netto) a.b", "(netto)").marks).toEqual(["(netto)"])
    expect(renderHighlight("a.b axb", "a.b").marks).toEqual(["a.b"])
  })
})
