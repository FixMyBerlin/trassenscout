// @vitest-environment jsdom

import { createFormHook } from "@tanstack/react-form"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { Combobox } from "@/src/components/core/components/forms/fields/Combobox"
import { fieldContext, formContext } from "@/src/components/core/components/forms/hooks/formContext"
import { FormHydratedProvider } from "@/src/components/core/components/forms/hooks/useFormHydrated"
import { TagsFormSection } from "./TagsFormSection"

const { tags, createTagFn, useUserCan } = vi.hoisted(() => ({
  tags: [] as { id: number; title: string; archivedAt: null }[],
  createTagFn: vi.fn(),
  useUserCan: vi.fn(),
}))

vi.mock("@/src/server/tags/tags.functions", () => ({ createTagFn }))
vi.mock("@/src/server/tags/tagsQueryOptions", () => ({
  tagsQueryOptions: () => ({ queryKey: ["tags"], queryFn: async () => ({ tags: [...tags] }) }),
}))
vi.mock("@/src/components/shared/app/memberships/hooks/useUserCan", () => ({ useUserCan }))
vi.mock("@/src/components/core/components/AdminBox/SuperAdminBox", () => ({
  SuperAdminBox: () => null,
}))
vi.mock("@/src/components/abschnitte/LinkWithFormDirtyConfirm", () => ({
  LinkWithFormDirtyConfirm: () => null,
}))

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { Combobox },
  formComponents: {},
})

function Harness() {
  const form = useAppForm({ defaultValues: { tags: [] as string[] } })

  return (
    <QueryClientProvider client={new QueryClient()}>
      <FormHydratedProvider value>
        <form.AppForm>
          <TagsFormSection projectSlug="lb" />
        </form.AppForm>
        <form.Subscribe selector={(state) => state.values.tags}>
          {(value) => <output data-testid="value">{value.join(",")}</output>}
        </form.Subscribe>
      </FormHydratedProvider>
    </QueryClientProvider>
  )
}

const search = (text: string) => {
  const input = screen.getByRole("combobox")
  fireEvent.click(input)
  fireEvent.change(input, { target: { value: text } })
  return input
}

describe("TagsFormSection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    tags.splice(0, tags.length, { id: 1, title: "Radverkehr", archivedAt: null })
    createTagFn.mockImplementation(async ({ data }: { data: { title: string } }) => {
      const tag = { id: 9, title: data.title, archivedAt: null }
      tags.push(tag)
      return tag
    })
  })

  test("creates a new tag and selects it right away", async () => {
    useUserCan.mockReturnValue({ edit: true })
    render(<Harness />)

    const input = search("Lastenrad")
    expect(await screen.findByRole("option", { name: "„Lastenrad“ erstellen" })).toBeVisible()
    fireEvent.keyDown(input, { key: "ArrowDown" })
    fireEvent.keyDown(input, { key: "Enter" })

    expect(await screen.findByRole("button", { name: "Lastenrad entfernen" })).toBeVisible()
    expect(screen.getByTestId("value")).toHaveTextContent(/^9$/)
    expect(createTagFn.mock.calls[0]?.[0]).toEqual({
      data: { projectSlug: "lb", title: "Lastenrad" },
    })
  })

  test("lets viewers assign but not create tags", async () => {
    useUserCan.mockReturnValue({ edit: false })
    render(<Harness />)

    await waitFor(() => expect(screen.getByRole("combobox")).toBeEnabled())
    search("Lastenrad")

    expect(screen.queryByRole("option", { name: /erstellen/ })).toBeNull()
    search("rad")
    expect(await screen.findByRole("option", { name: "Radverkehr" })).toBeVisible()
  })
})
