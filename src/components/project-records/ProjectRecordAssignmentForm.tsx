import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { FormHydratedProvider } from "@/src/components/core/components/forms/hooks/useFormHydrated"
import { useIsHydrated } from "@/src/components/core/components/forms/hooks/useIsHydrated"
import { useAssignedToItems } from "@/src/components/project-records/hooks/useAssignedToItems"
import { ProjectRecordAssignmentFields } from "@/src/components/project-records/ProjectRecordAssignmentFields"
import { invalidateAfterProjectRecordPatch } from "@/src/components/project-records/projectRecordQueryCache"
import { getProjectRecordAuthorLabel } from "@/src/components/project-records/utils/getProjectRecordAuthorLabel"
import { getUserComboboxItems } from "@/src/components/shared/app/users/utils/getUserSelectOptions"
import { projectUsersQueryOptions } from "@/src/server/memberships/projectUsersQueryOptions"
import { patchProjectRecordAssignmentFn } from "@/src/server/projectRecords/projectRecords.functions"
import type { ProjectRecord } from "@/src/server/projectRecords/types"

type Props = {
  projectRecord: ProjectRecord
}

type AssignmentValues = {
  assignedToId: number | null
}

function toAssignedToId(value: unknown) {
  if (value === "" || value == null) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function confirmAssignmentNotification(assigneeLabel: string) {
  return window.confirm(
    `Zuweisung an ${assigneeLabel} speichern? Die Person wird per E-Mail benachrichtigt.`,
  )
}

export const ProjectRecordAssignmentForm = ({ projectRecord }: Props) => {
  const projectSlug = projectRecord.project.slug
  const isHydrated = useIsHydrated()
  const queryClient = useQueryClient()
  const { data: users = [] } = useQuery(projectUsersQueryOptions({ projectSlug }))
  const assignedToItems = useAssignedToItems({
    projectSlug,
    users,
    subsubsectionIds: [
      projectRecord.subsubsectionId,
      ...projectRecord.subsubsections.map(({ id }) => id),
    ],
    acquisitionAreaIds: [
      projectRecord.acquisitionAreaId,
      ...projectRecord.acquisitionAreas.map(({ id }) => id),
    ],
  })
  const lastPersistedRef = useRef<AssignmentValues>({
    assignedToId: projectRecord.assignedToId ?? null,
  })
  const skipNextChangeListenerRef = useRef(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const patchAssignmentMutation = useMutation({ mutationFn: patchProjectRecordAssignmentFn })

  const form = useAppForm({
    defaultValues: {
      assignedToId: projectRecord.assignedToId,
    },
    listeners: {
      onChange: async ({ formApi }) => {
        if (skipNextChangeListenerRef.current) {
          skipNextChangeListenerRef.current = false
          return
        }

        const assignedToId = toAssignedToId(formApi.state.values.assignedToId)
        const previous = lastPersistedRef.current
        const willNotify = assignedToId !== previous.assignedToId && assignedToId != null

        if (willNotify) {
          const projectUsers =
            queryClient.getQueryData(projectUsersQueryOptions({ projectSlug }).queryKey) ?? users
          const assigneeItem = getUserComboboxItems(projectUsers).find(
            (item) => toAssignedToId(item.value) === assignedToId,
          )
          const assigneeLabel =
            (typeof assigneeItem?.label === "string"
              ? assigneeItem.label
              : assigneeItem?.searchText) ?? "diese Person"
          if (!confirmAssignmentNotification(assigneeLabel)) {
            skipNextChangeListenerRef.current = true
            formApi.setFieldValue("assignedToId", previous.assignedToId)
            return
          }
        }

        try {
          await patchAssignmentMutation.mutateAsync({
            data: {
              projectSlug,
              id: projectRecord.id,
              assignedToId,
            },
          })
          lastPersistedRef.current = { assignedToId }
          setSaveError(null)
          await invalidateAfterProjectRecordPatch(queryClient, {
            projectSlug,
            id: projectRecord.id,
          })
        } catch {
          skipNextChangeListenerRef.current = true
          formApi.setFieldValue("assignedToId", previous.assignedToId)
          setSaveError("Zuweisung konnte nicht gespeichert werden.")
        }
      },
    },
  })

  return (
    <FormHydratedProvider value={isHydrated}>
      <form.AppForm>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          <ProjectRecordAssignmentFields
            assignedToItems={assignedToItems}
            editingState={projectRecord.editingState}
            fromLabel={getProjectRecordAuthorLabel({
              type: projectRecord.projectRecordAuthorType,
              author: projectRecord.author,
            })}
          />
          {saveError ? (
            <div className="pt-2">
              <p role="alert" className="text-sm font-semibold text-red-800">
                {saveError}
              </p>
            </div>
          ) : null}
        </form>
      </form.AppForm>
    </FormHydratedProvider>
  )
}
