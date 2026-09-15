import type { ComboboxSingleItem } from "@/src/components/core/components/forms/ComboboxSingleBase"
import { fieldLayoutLabelClassName } from "@/src/components/core/components/forms/fieldLayoutStyles"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"

type Props = {
  assignedToItems: ComboboxSingleItem[]
  fromLabel?: string | null
}

export const ProjectRecordAssignmentFields = ({ assignedToItems, fromLabel }: Props) => {
  const form = useCoreAppFormContext()

  return (
    <div className={`grid gap-6 sm:items-start ${fromLabel ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
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
      {fromLabel && (
        <div>
          <p className={fieldLayoutLabelClassName}>Von</p>
          <p className="pt-2 text-sm text-gray-700">{fromLabel}</p>
        </div>
      )}
    </div>
  )
}
