import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { ProjectRecordEditingStateButton } from "@/src/components/project-records/ProjectRecordEditingStateButton"
import type { ProjectRecordEditingState } from "@/src/prisma/generated/browser"

export const ProjectRecordEditingStateSubmitButton = () => {
  const form = useCoreAppFormContext<{
    editingState: ProjectRecordEditingState
    assignedToId: number | string | null
  }>()

  return (
    <form.Subscribe
      selector={(state) => ({
        editingState: state.values.editingState,
        reassignedToPerson:
          Boolean(state.fieldMeta.assignedToId?.isDirty) &&
          state.values.assignedToId != null &&
          state.values.assignedToId !== "",
        isSubmitting: state.isSubmitting,
        canSubmit: state.canSubmit,
      })}
    >
      {({ editingState, reassignedToPerson, isSubmitting, canSubmit }) => {
        const save = reassignedToPerson ? "Speichern, Benachrichtigung senden" : "Speichern"
        return (
          <ProjectRecordEditingStateButton
            editingState={editingState}
            disabled={isSubmitting || !canSubmit}
            labels={{
              complete: `${save} und als abgeschlossen markieren`,
              reopen: `${save}, wiedereröffnen und als in Bearbeitung markieren`,
            }}
            onToggle={async (nextEditingState) => {
              form.setFieldValue("editingState", nextEditingState, { dontUpdateMeta: true })
              await form.handleSubmit()
              form.setFieldValue("editingState", editingState, { dontUpdateMeta: true })
            }}
          />
        )
      }}
    </form.Subscribe>
  )
}
