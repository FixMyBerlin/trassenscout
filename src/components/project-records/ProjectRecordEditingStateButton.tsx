import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  primaryButtonSmClassName,
  secondaryButtonSmClassName,
} from "@/src/components/core/components/buttons/buttonStyles"
import { invalidateAfterProjectRecordPatch } from "@/src/components/project-records/projectRecordQueryCache"
import { ProjectRecordEditingState, ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { patchProjectRecordAssignmentFn } from "@/src/server/projectRecords/projectRecords.functions"
import type { ProjectRecord } from "@/src/server/projectRecords/types"
import { projectRecordEditingStateLabel } from "@/src/shared/projectRecords/projectRecordEditingStateLabel"

type Props = {
  projectRecord: Pick<ProjectRecord, "id" | "editingState" | "reviewState"> & {
    project: Pick<ProjectRecord["project"], "slug">
  }
}

export const ProjectRecordEditingStateButton = ({ projectRecord }: Props) => {
  const projectSlug = projectRecord.project.slug
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: patchProjectRecordAssignmentFn,
    onSuccess: () =>
      invalidateAfterProjectRecordPatch(queryClient, { projectSlug, id: projectRecord.id }),
  })
  const save = (editingState: ProjectRecordEditingState) =>
    mutation.mutate({ data: { projectSlug, id: projectRecord.id, editingState } })

  if (projectRecord.reviewState !== ProjectRecordReviewState.APPROVED) return null

  return (
    <div className="flex flex-col items-end gap-1">
      {projectRecord.editingState === ProjectRecordEditingState.COMPLETED ? (
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => save(ProjectRecordEditingState.PENDING)}
          className={secondaryButtonSmClassName}
        >
          Wiedereröffnung und als in Bearbeitung markieren
        </button>
      ) : (
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => save(ProjectRecordEditingState.COMPLETED)}
          className={primaryButtonSmClassName}
        >
          <CheckCircleIcon className="size-5 shrink-0" aria-hidden />
          Als abgeschlossen markieren
        </button>
      )}
      <p role="status" className="sr-only">
        {mutation.isSuccess
          ? `Status: ${projectRecordEditingStateLabel[projectRecord.editingState]}`
          : null}
      </p>
      {mutation.isError ? (
        <p role="alert" className="text-sm font-semibold text-red-800">
          Status konnte nicht gespeichert werden.
        </p>
      ) : null}
    </div>
  )
}
