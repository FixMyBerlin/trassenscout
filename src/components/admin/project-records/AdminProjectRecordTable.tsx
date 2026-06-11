import { twJoin } from "tailwind-merge"
import { AdminBadge, type AdminBadgeVariant } from "@/src/components/admin/AdminBadge"
import {
  AdminTableEditLink,
  AdminTableExternalLink,
} from "@/src/components/admin/AdminTableActions"
import { TableDateTime } from "@/src/components/core/components/Table/TableDateTime"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { ProjectRecordEditingStateIndicator } from "@/src/components/project-records/ProjectRecordEditingStateIndicator"
import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import type { AdminProjectRecordWithRelations } from "@/src/server/projectRecords/types"

const projectRecordReviewStateBadgeVariant: Record<ProjectRecordReviewState, AdminBadgeVariant> = {
  [ProjectRecordReviewState.NEEDSREVIEW]: "yellow",
  [ProjectRecordReviewState.NEEDSADMINREVIEW]: "yellow",
  [ProjectRecordReviewState.REJECTED]: "red",
  [ProjectRecordReviewState.APPROVED]: "green",
}

const projectRecordReviewStateLabel: Record<ProjectRecordReviewState, string> = {
  [ProjectRecordReviewState.NEEDSREVIEW]: "Benötigt Bestätigung",
  [ProjectRecordReviewState.NEEDSADMINREVIEW]: "Benötigt Admin-Bestätigung",
  [ProjectRecordReviewState.REJECTED]: "Abgelehnt",
  [ProjectRecordReviewState.APPROVED]: "Bestätigt",
}

export const ProjectRecordReviewStatePill = ({ state }: { state: ProjectRecordReviewState }) => (
  <AdminBadge variant={projectRecordReviewStateBadgeVariant[state]}>
    {projectRecordReviewStateLabel[state]}
  </AdminBadge>
)

export const AdminProjectRecordsTable = ({
  projectRecords,
}: {
  projectRecords: AdminProjectRecordWithRelations[]
}) => {
  const spaceClasses = "px-3 py-2"
  const headerClasses = "text-left text-sm font-semibold text-gray-900"

  return (
    <>
      <TableWrapper className="mt-7">
        <div className="min-w-full divide-y divide-gray-300">
          <div className="bg-gray-50">
            <div className="grid grid-cols-8">
              <div className={twJoin(spaceClasses, headerClasses)}>
                <span className="sr-only">Status</span>
              </div>
              <div className={twJoin(spaceClasses, headerClasses)}>ID</div>
              <div className={twJoin(spaceClasses, headerClasses)}>Datum Email</div>
              <div className={twJoin(spaceClasses, headerClasses)}>Prozessiert am</div>
              <div className={twJoin(spaceClasses, twJoin(headerClasses, "col-span-2"))}>Titel</div>
              <div className={twJoin(spaceClasses, headerClasses)}>Projekt</div>
              <div className={twJoin(spaceClasses, headerClasses)}>Bestätigung</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 bg-white">
            {projectRecords.length ? (
              projectRecords.map((projectRecord) => (
                <div key={projectRecord.id} className="grid grid-cols-8">
                  <div className={twJoin(spaceClasses, "text-sm text-gray-900")}>
                    <ProjectRecordEditingStateIndicator
                      editingState={projectRecord.editingState}
                      variant="table"
                    />
                  </div>
                  <div className={twJoin(spaceClasses, "text-sm text-gray-900")}>
                    {projectRecord.id}
                  </div>
                  <div className={twJoin(spaceClasses, "text-sm text-gray-900")}>
                    <TableDateTime value={projectRecord.date} />
                  </div>
                  <div className={twJoin(spaceClasses, "text-sm text-gray-900")}>
                    <TableDateTime value={projectRecord.createdAt} />
                  </div>
                  <div
                    className={twJoin(
                      spaceClasses,
                      "col-span-2 text-sm font-semibold text-blue-500",
                    )}
                  >
                    {projectRecord.title}
                  </div>
                  <div className={twJoin(spaceClasses, "text-sm text-gray-900")}>
                    <AdminTableExternalLink href={`/${projectRecord.project.slug}/project-records`}>
                      {shortTitle(projectRecord.project.slug)}
                    </AdminTableExternalLink>
                  </div>
                  <div className={twJoin(spaceClasses, "text-sm text-gray-900")}>
                    <div className="flex flex-col gap-1">
                      <ProjectRecordReviewStatePill state={projectRecord.reviewState} />
                      <AdminTableEditLink to={`/admin/project-records/${projectRecord.id}/edit`}>
                        Bestätigen
                      </AdminTableEditLink>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <ZeroCase visible={projectRecords.length} name="Protokolleintrag" />
            )}
          </div>
        </div>
      </TableWrapper>
    </>
  )
}
