// @vitest-environment jsdom

import { createFormHook } from "@tanstack/react-form"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"
import { fieldContext, formContext } from "@/src/components/core/components/forms/hooks/formContext"
import { FormHydratedProvider } from "@/src/components/core/components/forms/hooks/useFormHydrated"
import { Combobox } from "./Combobox"

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { Combobox },
  formComponents: {},
})

const items = [
  { value: "1", label: "Fußverkehr" },
  { value: "2", label: "Radverkehr" },
  { value: "3", label: "ÖPNV" },
  { value: "4", label: "Lärm (archiviert)", searchText: "Lärm" },
]

function Harness({
  initial = [],
  onCreate,
}: {
  initial?: string[]
  onCreate?: (title: string) => Promise<void> | void
}) {
  const form = useAppForm({ defaultValues: { tags: initial } })

  return (
    <FormHydratedProvider value>
      <form.AppField name="tags">
        {(field) => <field.Combobox label="Tags" items={items} chips onCreate={onCreate} />}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.tags}>
        {(tags) => <output data-testid="value">{tags.join(",")}</output>}
      </form.Subscribe>
    </FormHydratedProvider>
  )
}

const typeSearch = (text: string) => {
  const input = screen.getByRole("combobox")
  fireEvent.click(input)
  fireEvent.change(input, { target: { value: text } })
}

describe("Combobox with chips", () => {
  test("shows selected items as chips that can be removed one by one", async () => {
    render(<Harness initial={["1", "2"]} />)

    fireEvent.click(screen.getByRole("button", { name: "Fußverkehr entfernen" }))

    await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent(/^2$/))
    expect(screen.queryByRole("button", { name: "Fußverkehr entfernen" })).toBeNull()
    expect(screen.getByRole("button", { name: "Radverkehr entfernen" })).toBeVisible()
  })

  test("keeps the list in item order instead of moving selected items up", async () => {
    render(<Harness initial={["3"]} />)

    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" })

    const options = await screen.findAllByRole("option")
    expect(options.map((option) => option.textContent)).toEqual([
      "Fußverkehr",
      "Radverkehr",
      "ÖPNV",
      "Lärm (archiviert)",
    ])
  })

  test("offers to create a missing name via keyboard and passes the trimmed search", async () => {
    const onCreate = vi.fn()
    render(<Harness onCreate={onCreate} />)

    typeSearch("  Lastenrad ")
    expect(await screen.findByRole("option", { name: "„Lastenrad“ erstellen" })).toBeVisible()
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" })
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" })

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith("Lastenrad"))
    expect(screen.getByTestId("value")).toHaveTextContent(/^$/)
  })

  test("matches items by their search text, e.g. archived tags", async () => {
    render(<Harness onCreate={vi.fn()} />)

    typeSearch("lärm")

    expect(await screen.findByRole("option", { name: "Lärm (archiviert)" })).toBeVisible()
    expect(screen.queryByRole("option", { name: /erstellen/ })).toBeNull()
  })

  test("creates only once when Enter is pressed again while creating", async () => {
    let finish = () => {}
    const onCreate = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    render(<Harness onCreate={onCreate} />)

    typeSearch("Lastenrad")
    const input = screen.getByRole("combobox")
    fireEvent.keyDown(input, { key: "ArrowDown" })
    fireEvent.keyDown(input, { key: "Enter" })
    fireEvent.keyDown(input, { key: "Enter" })
    finish()

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1))
  })

  test("shows an error and keeps the search when creating fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const onCreate = vi.fn().mockRejectedValue(new Error("offline"))
    render(<Harness onCreate={onCreate} />)

    typeSearch("Lastenrad")
    const input = screen.getByRole("combobox")
    fireEvent.keyDown(input, { key: "ArrowDown" })
    fireEvent.keyDown(input, { key: "Enter" })

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "„Lastenrad“ konnte nicht erstellt werden. Bitte erneut versuchen.",
    )
    expect(input).toHaveValue("Lastenrad")
  })

  test("does not offer to create a name that exists in another case", async () => {
    render(<Harness onCreate={vi.fn()} />)

    typeSearch("radverkehr")

    expect(await screen.findByRole("option", { name: "Radverkehr" })).toBeVisible()
    expect(screen.queryByRole("option", { name: /erstellen/ })).toBeNull()
  })
})
