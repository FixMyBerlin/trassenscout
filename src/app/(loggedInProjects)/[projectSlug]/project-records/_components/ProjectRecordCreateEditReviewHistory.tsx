import { ProjectRecordReviewStatePill } from "@/src/app/(admin)/admin/project-records/_components/AdminProjectRecordTable"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { isAdmin } from "@/src/app/_components/users/utils/isAdmin"
import { SuperAdminBox } from "@/src/core/components/AdminBox/SuperAdminBox"
import { formatBerlinTime } from "@/src/core/utils/formatBerlinTime"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import getProjectRecordAdmin from "@/src/server/projectRecords/queries/getProjectRecordAdmin"
import getProjectRecords from "@/src/server/projectRecords/queries/getProjectRecords"
import { useCurrentUser } from "@/src/server/users/hooks/useCurrentUser"
import { ProjectRecordReviewState, ProjectRecordType } from "@prisma/client"
import { Fragment } from "react"

const getProjectRecordAuthorLabel = ({
  type,
  author,
}: {
  type: ProjectRecordType
  author?: Awaited<ReturnType<typeof getProjectRecord>>["author"] | null
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
  projectRecord:
    | Awaited<ReturnType<typeof getProjectRecordAdmin>>
    | Awaited<ReturnType<typeof getProjectRecords>>[0]
    | Awaited<ReturnType<typeof getProjectRecord>>
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
  projectRecord:
    | Awaited<ReturnType<typeof getProjectRecordAdmin>>
    | Awaited<ReturnType<typeof getProjectRecords>>[0]
    | Awaited<ReturnType<typeof getProjectRecord>>
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

  // Admins always see the create edit review details
  return (
    <SuperAdminBox>
      <CreateEditReviewHistoryComponent projectRecord={projectRecord} />
    </SuperAdminBox>
  )
}
