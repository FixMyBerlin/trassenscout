import type { ComboboxSingleItem } from "@/src/components/core/components/forms/ComboboxSingleBase"
import { fieldLayoutLabelClassName } from "@/src/components/core/components/forms/fieldLayoutStyles"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { ProjectRecordEditingStateIndicator } from "@/src/components/project-records/ProjectRecordEditingStateIndicator"
import type { ProjectRecordEditingState } from "@/src/prisma/generated/browser"

type Props = {
  assignedToItems: ComboboxSingleItem[]
  fromLabel?: string | null
  editingState: ProjectRecordEditingState
}

export const ProjectRecordAssignmentFields = ({
  assignedToItems,
  fromLabel,
  editingState,
}: Props) => {
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
      <div>
        <p className={fieldLayoutLabelClassName}>Status</p>
        <div className="pt-2">
          <ProjectRecordEditingStateIndicator editingState={editingState} variant="detail" />
        </div>
      </div>
      {fromLabel && (
        <div>
          <p className={fieldLayoutLabelClassName}>Erstellt von</p>
          <p className="pt-2 text-sm text-gray-700">{fromLabel}</p>
        </div>
      )}
    </div>
  )
}
