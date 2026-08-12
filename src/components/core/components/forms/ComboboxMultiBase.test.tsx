// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, test } from "vitest"
import { ComboboxMultiBase } from "./ComboboxMultiBase"

const items = [
  { value: "PENDING", label: "Ausstehend" },
  { value: "ACCEPTED", label: "Angenommen" },
  { value: "REJECTED", label: "Abgelehnt" },
]

function ControlledCombobox({ initialValue = [] }: { initialValue?: string[] }) {
  const [value, setValue] = useState(initialValue)

  return (
    <>
      <ComboboxMultiBase
        value={value}
        onChange={setValue}
        items={items}
        placeholder="Status suchen"
        allSelectedLabel="Alle Status"
        selectedCountLabel={(count) => `${count} Status ausgewählt`}
      />
      <output data-testid="selected-value">{value.join(",")}</output>
    </>
  )
}

describe("ComboboxMultiBase", () => {
  test("keeps multiple selected values", async () => {
    render(<ControlledCombobox />)

    fireEvent.click(screen.getByRole("button", { name: "Alle Status" }))

    const input = await screen.findByRole("combobox")
    fireEvent.keyDown(input, { key: "Enter" })
    fireEvent.keyDown(input, { key: "ArrowDown" })
    fireEvent.keyDown(input, { key: "Enter" })

    await waitFor(() => {
      expect(screen.getByTestId("selected-value")).toHaveTextContent("PENDING,ACCEPTED")
    })
    expect(screen.getByRole("button", { name: "2 Status ausgewählt" })).toBeVisible()
  })

  test("shows the all-selected label for empty and complete selections", () => {
    const { unmount } = render(<ControlledCombobox />)

    expect(screen.getByRole("button", { name: "Alle Status" })).toBeVisible()

    unmount()
    render(<ControlledCombobox initialValue={items.map((item) => item.value)} />)

    expect(screen.getByRole("button", { name: "Alle Status" })).toBeVisible()
  })
})
