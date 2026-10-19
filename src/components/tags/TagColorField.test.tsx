// @vitest-environment jsdom

import { createFormHook } from "@tanstack/react-form"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { fieldContext, formContext } from "@/src/components/core/components/forms/hooks/formContext"
import { ProjectRecordTagsList } from "@/src/components/project-records/ProjectRecordTagsList"
import { TagColorField } from "./TagColorField"
import type { TagColor } from "./tagColors"

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
})

function Harness() {
  const form = useAppForm({ defaultValues: { color: "LIGHT_BLUE" as TagColor } })

  return (
    <>
      <form.AppField name="color">{() => <TagColorField />}</form.AppField>
      <form.Subscribe selector={(state) => state.values.color}>
        {(color) => <output data-testid="value">{color}</output>}
      </form.Subscribe>
    </>
  )
}

describe("TagColorField", () => {
  test("offers the ten design colours and selects one on click", async () => {
    render(<Harness />)

    expect(screen.getByRole("radiogroup", { name: "Farbe" })).toBeVisible()
    expect(screen.getAllByRole("radio")).toHaveLength(10)
    expect(screen.getByRole("radio", { name: "Hellblau" })).toBeChecked()

    fireEvent.click(screen.getByRole("radio", { name: "Rosa" }))

    await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("PINK"))
    expect(screen.getByRole("radio", { name: "Rosa" })).toBeChecked()
  })
})

describe("ProjectRecordTagsList colours", () => {
  test("renders coloured tags with the palette and the description as tooltip", () => {
    render(
      <ProjectRecordTagsList
        tags={[
          { id: 1, title: "Finanzierung", color: "PINK", description: "Förderung und Budget" },
          { id: 2, title: "Beteiligung" },
        ]}
      />,
    )

    const colored = screen.getByText("#Finanzierung")
    expect(colored).toHaveClass("bg-[#FFB9DD]", "border-[#EE99C7]", "text-[#7A2851]")
    expect(colored).toHaveAttribute("title", "Förderung und Budget")
    expect(screen.getByText("#Beteiligung")).toHaveClass("bg-gray-100")
  })
})
