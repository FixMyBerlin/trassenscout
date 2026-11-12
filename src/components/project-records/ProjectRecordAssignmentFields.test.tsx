// @vitest-environment jsdom

import { createFormHook } from "@tanstack/react-form"
import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { ComboboxSingle } from "@/src/components/core/components/forms/fields/ComboboxSingle"
import { fieldContext, formContext } from "@/src/components/core/components/forms/hooks/formContext"
import { FormHydratedProvider } from "@/src/components/core/components/forms/hooks/useFormHydrated"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import { ProjectRecordAssignmentFields } from "./ProjectRecordAssignmentFields"

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { ComboboxSingle },
  formComponents: {},
})

function Harness({ editingState }: { editingState: ProjectRecordEditingState }) {
  const form = useAppForm({ defaultValues: { assignedToId: null as number | null } })

  return (
    <FormHydratedProvider value>
      <form.AppForm>
        <ProjectRecordAssignmentFields assignedToItems={[]} editingState={editingState} />
      </form.AppForm>
    </FormHydratedProvider>
  )
}

describe("ProjectRecordAssignmentFields", () => {
  test("shows the status as text, with no switch to change it", () => {
    render(<Harness editingState={ProjectRecordEditingState.COMPLETED} />)

    expect(screen.getByText("Abgeschlossen")).toBeInTheDocument()
    expect(screen.queryByRole("switch")).toBeNull()
  })
})
