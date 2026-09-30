import type { ReactNode } from "react"
import { ProjectRecordReviewStatePill } from "@/src/components/admin/project-records/AdminProjectRecordTable"
import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import {
  projectRecordSectionClassName,
  projectRecordSectionLabelClassName,
  projectRecordSectionValueClassName,
} from "@/src/components/project-records/ProjectRecordSummary"
import { getProjectRecordAuthorLabel } from "@/src/components/project-records/utils/getProjectRecordAuthorLabel"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { isAdmin } from "@/src/components/shared/app/users/utils/isAdmin"
import { useCurrentUser } from "@/src/components/user/useCurrentUser"
import { ProjectRecordReviewState, ProjectRecordType } from "@/src/prisma/generated/browser"
import type {
  ProjectRecord,
  ProjectRecordAdmin,
  ProjectRecordListItem,
} from "@/src/server/projectRecords/types"

const formatAuthorWithTimestamp = ({
  label,
  timestamp,
}: {
  label: string
  timestamp?: Date | null
}) => {
  if (!timestamp) return label

  return `${label} am ${formatBerlinTime(timestamp, "dd.MM.yyyy, HH:mm")}`
}

const CreateEditReviewHistoryComponent = ({
  projectRecord,
  showReview,
}: {
  projectRecord: ProjectRecordAdmin | ProjectRecordListItem | ProjectRecord
  showReview: boolean
}) => {
  const rows: { label: string; value: ReactNode }[] = []

  const systemNote = [
    `Erstellt: ${formatAuthorWithTimestamp({
      label: getProjectRecordAuthorLabel({
        type: projectRecord.projectRecordAuthorType,
        author: projectRecord.author,
      }),
      timestamp: projectRecord.createdAt,
    })}`,
    `Zuletzt bearbeitet: ${
      projectRecord.projectRecordUpdatedByType
        ? formatAuthorWithTimestamp({
            label: getProjectRecordAuthorLabel({
              type: projectRecord.projectRecordUpdatedByType,
              author: projectRecord.updatedBy,
            }),
            timestamp: projectRecord.updatedAt,
          })
        : "—"
    }`,
  ]

  if (
    showReview &&
    projectRecord.projectRecordAuthorType === ProjectRecordType.SYSTEM &&
    projectRecord.reviewState !== ProjectRecordReviewState.APPROVED
  ) {
    rows.push({
      label: "Bestätigungsstatus:",
      value: <ProjectRecordReviewStatePill state={projectRecord.reviewState} />,
    })
  }

  if (
    showReview &&
    projectRecord.projectRecordAuthorType === ProjectRecordType.SYSTEM &&
    projectRecord.reviewState === ProjectRecordReviewState.APPROVED &&
    projectRecord.reviewedBy
  ) {
    rows.push({
      label: "Bestätigung durch:",
      value: formatAuthorWithTimestamp({
        label: getFullnameWithInstitution(projectRecord.reviewedBy) || "Nutzer*in",
        timestamp: projectRecord.reviewedAt,
      }),
    })
  }

  if (
    showReview &&
    projectRecord.projectRecordAuthorType === ProjectRecordType.SYSTEM &&
    projectRecord.reviewNotes
  ) {
    rows.push({
      label: "Bestätigungsnotiz:",
      value: projectRecord.reviewNotes,
    })
  }

  return (
    <div className="mt-8 max-w-5xl px-4">
      {rows.length > 0 && (
        <div className="space-y-4 border-y border-gray-200 py-4">
          {rows.map((row) => (
            <div key={row.label} className={projectRecordSectionClassName}>
              <p className={projectRecordSectionLabelClassName}>{row.label}</p>
              <div className={projectRecordSectionValueClassName}>{row.value}</div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
        {systemNote.map((entry) => (
          <span key={entry}>{entry}</span>
        ))}
      </p>
    </div>
  )
}

export const CreateEditReviewHistory = ({
  projectRecord,
}: {
  projectRecord: ProjectRecordAdmin | ProjectRecordListItem | ProjectRecord
}) => {
  const isUserAdmin = isAdmin(useCurrentUser())
  const userCanEdit = useUserCan(projectRecord.project.slug).edit
  const showReview = isUserAdmin || (projectRecord.project.aiEnabled && userCanEdit)

  return <CreateEditReviewHistoryComponent projectRecord={projectRecord} showReview={showReview} />
}
