// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"
import { ComboboxSingleBase, type ComboboxSingleItem } from "./ComboboxSingleBase"

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)

const heading = "Systemvorschläge"
const items: ComboboxSingleItem[] = [
  { value: "", label: "(Keine Auswahl)" },
  { value: "1", label: "Lena Lang", group: heading },
  { value: "2", label: "Max Bauer", group: heading },
  { value: "3", label: "Anna Adler" },
]

async function openCombobox(comboboxItems = items, onChange = vi.fn()) {
  render(<ComboboxSingleBase value="" onChange={onChange} items={comboboxItems} />)
  fireEvent.click(screen.getByRole("button", { name: "(Keine Auswahl)" }))
  return { input: await screen.findByRole("combobox"), onChange }
}

const optionLabels = () => screen.getAllByRole("option").map((option) => option.textContent)
const separators = () => [...screen.getByRole("listbox").querySelectorAll("[role=presentation]")]

describe("ComboboxSingleBase groups", () => {
  test("puts a heading above the group and a line below it, neither is an option", async () => {
    await openCombobox()

    expect(optionLabels()).toEqual(["(Keine Auswahl)", "Lena Lang", "Max Bauer", "Anna Adler"])
    const [headingRow, line] = separators()
    expect(headingRow).toHaveTextContent(heading)
    expect(headingRow?.nextElementSibling).toHaveTextContent("Lena Lang")
    expect(line).toHaveTextContent("")
    expect(line?.nextElementSibling).toHaveTextContent("Anna Adler")
  })

  test("adds neither without a group", async () => {
    await openCombobox(items.map(({ value, label }) => ({ value, label })))

    expect(separators()).toEqual([])
  })

  test("adds no line when the group ends the list", async () => {
    await openCombobox(items.slice(0, 3))

    expect(separators()).toHaveLength(1)
  })

  test("arrow keys go from the option above the heading to the first one below it", async () => {
    const { input, onChange } = await openCombobox()

    fireEvent.keyDown(input, { key: "ArrowDown" })
    fireEvent.keyDown(input, { key: "Enter" })

    expect(onChange).toHaveBeenCalledWith("1")
  })

  test("clicking the heading or the line selects nothing", async () => {
    const { onChange } = await openCombobox()

    for (const separator of separators()) {
      fireEvent.mouseDown(separator)
      fireEvent.click(separator)
    }

    expect(onChange).not.toHaveBeenCalled()
  })

  test("searching keeps the heading while a group member matches", async () => {
    const { input } = await openCombobox()

    fireEvent.change(input, { target: { value: "max" } })

    expect(optionLabels()).toEqual(["Max Bauer"])
    expect(separators()).toHaveLength(1)
    expect(screen.getByText(heading)).toBeVisible()
  })

  test("searching removes heading and line when no group member matches", async () => {
    const { input } = await openCombobox()

    fireEvent.change(input, { target: { value: "anna" } })

    expect(optionLabels()).toEqual(["Anna Adler"])
    expect(separators()).toEqual([])
  })

  test("searching for the heading's text finds nobody", async () => {
    const { input } = await openCombobox()

    fireEvent.change(input, { target: { value: "system" } })

    expect(screen.queryAllByRole("option")).toEqual([])
    expect(screen.queryByText(heading)).not.toBeInTheDocument()
  })
})
