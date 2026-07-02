import { Fragment } from "react"
import { ProjectRecordReviewStatePill } from "@/src/components/admin/project-records/AdminProjectRecordTable"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { getFullname } from "@/src/components/core/users/getFullname"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
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
  const rows = [
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

  return (
    <div className="mt-8 grid max-w-5xl grid-cols-[minmax(0,220px)_minmax(0,1fr)] gap-x-8 gap-y-3 text-sm sm:text-[15px]">
      {rows.map((row) => (
        <Fragment key={row.label}>
          <span className="font-medium text-gray-700">{row.label}</span>
          <span className="text-gray-500">{row.value}</span>
        </Fragment>
      ))}

      {projectRecord.projectRecordAuthorType === ProjectRecordType.SYSTEM &&
        projectRecord.reviewState !== ProjectRecordReviewState.APPROVED && (
          <>
            <span className="font-medium text-gray-700">Bestätigungsstatus:</span>
            <span className="text-gray-500">
              <ProjectRecordReviewStatePill state={projectRecord.reviewState} />
            </span>
          </>
        )}

      {projectRecord.projectRecordAuthorType === ProjectRecordType.SYSTEM &&
        projectRecord.reviewState === ProjectRecordReviewState.APPROVED &&
        projectRecord.reviewedBy && (
          <>
            <span className="font-medium text-gray-700">Bestätigung durch:</span>
            <span className="text-gray-500">
              {formatAuthorWithTimestamp({
                label: getFullname(projectRecord.reviewedBy) || "Nutzer*in",
                timestamp: projectRecord.reviewedAt,
              })}
            </span>
          </>
        )}

      {projectRecord.projectRecordAuthorType === ProjectRecordType.SYSTEM &&
        projectRecord.reviewNotes && (
          <>
            <span className="font-medium text-gray-700">Bestätigungsnotiz:</span>
            <span className="text-gray-500">{projectRecord.reviewNotes}</span>
          </>
        )}
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
