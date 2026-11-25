// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"
import { BackgroundSwitcher } from "./BackgroundSwitcher"

const renderSwitcher = (position: "top-left" | "bottom-left") =>
  render(
    <BackgroundSwitcher value="vector" onChange={() => {}} position={position}>
      <label>
        <input type="checkbox" /> Radinfrastruktur
      </label>
    </BackgroundSwitcher>,
  )

const checkboxComesFirst = () => {
  const checkbox = screen.getByRole("checkbox", { name: "Radinfrastruktur" })
  const dropdown = screen.getByRole("button", { name: /Kartenlayer einblenden/ })
  return Boolean(checkbox.compareDocumentPosition(dropdown) & Node.DOCUMENT_POSITION_FOLLOWING)
}

describe("BackgroundSwitcher", () => {
  afterEach(cleanup)

  test("puts extra controls below the dropdown at the top", () => {
    renderSwitcher("top-left")
    expect(checkboxComesFirst()).toBe(false)
  })

  test("puts extra controls above the dropdown at the bottom, also in tab order", () => {
    renderSwitcher("bottom-left")
    expect(checkboxComesFirst()).toBe(true)
  })
})
