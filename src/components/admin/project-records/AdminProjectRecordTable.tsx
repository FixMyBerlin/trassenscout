import { twJoin } from "tailwind-merge"
import { AdminBadge, type AdminBadgeVariant } from "@/src/components/admin/AdminBadge"
import {
  adminTableBodyClassName,
  adminTableCellClassName,
  adminTableHeaderClassName,
  adminTableHeadRowClassName,
  adminTableRowClassName,
} from "@/src/components/admin/adminListClasses"
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
  return (
    <>
      <TableWrapper withTopBorder className="mt-7">
        <div>
          <div className={adminTableHeadRowClassName}>
            <div className="grid grid-cols-8">
              <div className={adminTableHeaderClassName}>
                <span className="sr-only">Status</span>
              </div>
              <div className={adminTableHeaderClassName}>ID</div>
              <div className={adminTableHeaderClassName}>Datum Email</div>
              <div className={adminTableHeaderClassName}>Prozessiert am</div>
              <div className={twJoin(adminTableHeaderClassName, "col-span-2")}>Titel</div>
              <div className={adminTableHeaderClassName}>Projekt</div>
              <div className={adminTableHeaderClassName}>Bestätigung</div>
            </div>
          </div>
          <div className={adminTableBodyClassName}>
            {projectRecords.length ? (
              projectRecords.map((projectRecord) => (
                <div
                  key={projectRecord.id}
                  className={twJoin("grid grid-cols-8", adminTableRowClassName)}
                >
                  <div className={twJoin(adminTableCellClassName, "text-sm text-gray-900")}>
                    <ProjectRecordEditingStateIndicator
                      editingState={projectRecord.editingState}
                      variant="table"
                    />
                  </div>
                  <div className={twJoin(adminTableCellClassName, "text-sm text-gray-900")}>
                    {projectRecord.id}
                  </div>
                  <div className={twJoin(adminTableCellClassName, "text-sm text-gray-900")}>
                    <TableDateTime value={projectRecord.date} />
                  </div>
                  <div className={twJoin(adminTableCellClassName, "text-sm text-gray-900")}>
                    <TableDateTime value={projectRecord.createdAt} />
                  </div>
                  <div
                    className={twJoin(
                      adminTableCellClassName,
                      "col-span-2 text-sm font-semibold text-blue-500",
                    )}
                  >
                    {projectRecord.title}
                  </div>
                  <div className={twJoin(adminTableCellClassName, "text-sm text-gray-900")}>
                    <AdminTableExternalLink href={`/${projectRecord.project.slug}/project-records`}>
                      {shortTitle(projectRecord.project.slug)}
                    </AdminTableExternalLink>
                  </div>
                  <div className={twJoin(adminTableCellClassName, "text-sm text-gray-900")}>
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
