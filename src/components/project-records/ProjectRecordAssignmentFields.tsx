import type { ComboboxSingleItem } from "@/src/components/core/components/forms/ComboboxSingleBase"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"

type Props = {
  assignedToItems: ComboboxSingleItem[]
}

export const ProjectRecordAssignmentFields = ({ assignedToItems }: Props) => {
  const form = useCoreAppFormContext()

  return (
    <div className="grid gap-6 sm:grid-cols-2 sm:items-start">
      <form.AppField name="assignedToId">
        {(field) => (
          <field.ComboboxSingle
            items={assignedToItems}
            label="Zuweisen an"
            placeholder="Nutzer suchen"
          />
        )}
      </form.AppField>
      <form.AppField name="editingState">
        {(field) => (
          <field.Switch
            values={{
              off: ProjectRecordEditingState.PENDING,
              on: ProjectRecordEditingState.COMPLETED,
            }}
            label="Status"
            contentClassName="pt-2"
            stateLabels={{
              off: "In Bearbeitung",
              on: "Abgeschlossen",
            }}
            trackClassNames={{
              off: "bg-blue-500",
              on: "bg-gray-300",
            }}
          />
        )}
      </form.AppField>
    </div>
  )
}
