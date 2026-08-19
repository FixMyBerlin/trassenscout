import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { FormHydratedProvider } from "@/src/components/core/components/forms/hooks/useFormHydrated"
import { useIsHydrated } from "@/src/components/core/components/forms/hooks/useIsHydrated"
import { ProjectRecordAssignmentFields } from "@/src/components/project-records/ProjectRecordAssignmentFields"
import { getUserComboboxItems } from "@/src/components/shared/app/users/utils/getUserSelectOptions"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import { projectUsersQueryOptions } from "@/src/server/memberships/projectUsersQueryOptions"
import { patchProjectRecordAssignmentFn } from "@/src/server/projectRecords/projectRecords.functions"
import {
  projectRecordQueryOptions,
  projectRecordsNeedsReviewQueryOptions,
  projectRecordsQueryOptions,
} from "@/src/server/projectRecords/projectRecordsQueryOptions"
import type { ProjectRecord } from "@/src/server/projectRecords/types"

type Props = {
  projectRecord: ProjectRecord
}

type AssignmentValues = {
  assignedToId: number | null
  editingState: ProjectRecordEditingState
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
  const lastPersistedRef = useRef<AssignmentValues>({
    assignedToId: projectRecord.assignedToId ?? null,
    editingState: projectRecord.editingState,
  })
  const skipNextChangeListenerRef = useRef(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const patchAssignmentMutation = useMutation({ mutationFn: patchProjectRecordAssignmentFn })

  const form = useAppForm({
    defaultValues: {
      assignedToId: projectRecord.assignedToId,
      editingState: projectRecord.editingState,
    },
    listeners: {
      onChange: async ({ formApi }) => {
        if (skipNextChangeListenerRef.current) {
          skipNextChangeListenerRef.current = false
          return
        }

        const assignedToId = toAssignedToId(formApi.state.values.assignedToId)
        const { editingState } = formApi.state.values
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
              editingState,
            },
          })
          lastPersistedRef.current = { assignedToId, editingState }
          setSaveError(null)
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: projectRecordQueryOptions({ projectSlug, id: projectRecord.id }).queryKey,
            }),
            queryClient.invalidateQueries({
              queryKey: projectRecordsQueryOptions({ projectSlug }).queryKey,
            }),
            queryClient.invalidateQueries({
              queryKey: projectRecordsNeedsReviewQueryOptions({ projectSlug }).queryKey,
            }),
          ])
        } catch {
          skipNextChangeListenerRef.current = true
          formApi.setFieldValue("assignedToId", previous.assignedToId)
          formApi.setFieldValue("editingState", previous.editingState)
          setSaveError("Zuweisung oder Status konnte nicht gespeichert werden.")
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
          <ProjectRecordAssignmentFields assignedToItems={getUserComboboxItems(users)} />
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
