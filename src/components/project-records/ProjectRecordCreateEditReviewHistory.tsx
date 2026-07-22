import type { ReactNode } from "react"
import { ProjectRecordReviewStatePill } from "@/src/components/admin/project-records/AdminProjectRecordTable"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { getFullname } from "@/src/components/core/users/getFullname"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import {
  projectRecordSectionClassName,
  projectRecordSectionLabelClassName,
  projectRecordSectionValueClassName,
} from "@/src/components/project-records/ProjectRecordSummary"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { isAdmin } from "@/src/components/shared/app/users/utils/isAdmin"
import { useCurrentUser } from "@/src/components/user/useCurrentUser"
import { ProjectRecordReviewState, ProjectRecordType } from "@/src/prisma/generated/browser"
import type {
  ProjectRecord,
  ProjectRecordAdmin,
  ProjectRecordListItem,
} from "@/src/server/projectRecords/types"

const getProjectRecordAuthorLabel = ({
  type,
  author,
}: {
  type: ProjectRecordType
  author?: ProjectRecord["author"] | null
}) => {
  if (type === ProjectRecordType.SYSTEM) return "KI"

  return getFullname(author ?? null) || "Nutzer*in"
}

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
}: {
  projectRecord: ProjectRecordAdmin | ProjectRecordListItem | ProjectRecord
}) => {
  const rows: { label: string; value: ReactNode }[] = [
    {
      label: "Erstellt:",
      value: formatAuthorWithTimestamp({
        label: getProjectRecordAuthorLabel({
          type: projectRecord.projectRecordAuthorType,
          author: projectRecord.author,
        }),
        timestamp: projectRecord.createdAt,
      }),
    },
    {
      label: "Zuletzt bearbeitet:",
      value: projectRecord.projectRecordUpdatedByType
        ? formatAuthorWithTimestamp({
            label: getProjectRecordAuthorLabel({
              type: projectRecord.projectRecordUpdatedByType,
              author: projectRecord.updatedBy,
            }),
            timestamp: projectRecord.updatedAt,
          })
        : "—",
    },
  ]

  if (
    projectRecord.projectRecordAuthorType === ProjectRecordType.SYSTEM &&
    projectRecord.reviewState !== ProjectRecordReviewState.APPROVED
  ) {
    rows.push({
      label: "Bestätigungsstatus:",
      value: <ProjectRecordReviewStatePill state={projectRecord.reviewState} />,
    })
  }

  if (
    projectRecord.projectRecordAuthorType === ProjectRecordType.SYSTEM &&
    projectRecord.reviewState === ProjectRecordReviewState.APPROVED &&
    projectRecord.reviewedBy
  ) {
    rows.push({
      label: "Bestätigung durch:",
      value: formatAuthorWithTimestamp({
        label: getFullname(projectRecord.reviewedBy) || "Nutzer*in",
        timestamp: projectRecord.reviewedAt,
      }),
    })
  }

  if (
    projectRecord.projectRecordAuthorType === ProjectRecordType.SYSTEM &&
    projectRecord.reviewNotes
  ) {
    rows.push({
      label: "Bestätigungsnotiz:",
      value: projectRecord.reviewNotes,
    })
  }

  return (
    <div className="mt-8 max-w-5xl space-y-4 border-y border-gray-200 py-4">
      {rows.map((row) => (
        <div key={row.label} className={projectRecordSectionClassName}>
          <p className={projectRecordSectionLabelClassName}>{row.label}</p>
          <div className={projectRecordSectionValueClassName}>{row.value}</div>
        </div>
      ))}
    </div>
  )
}

export const CreateEditReviewHistory = ({
  projectRecord,
}: {
  projectRecord: ProjectRecordAdmin | ProjectRecordListItem | ProjectRecord
}) => {
  const user = useCurrentUser()
  const isUserAdmin = isAdmin(user)
  const aiEnabled = projectRecord.project.aiEnabled

  if (!aiEnabled && !isUserAdmin) return null

  if (aiEnabled)
    return (
      <IfUserCanEdit>
        <CreateEditReviewHistoryComponent projectRecord={projectRecord} />
      </IfUserCanEdit>
    )

  return (
    <SuperAdminBox>
      <CreateEditReviewHistoryComponent projectRecord={projectRecord} />
    </SuperAdminBox>
  )
}
