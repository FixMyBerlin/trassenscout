import { twJoin } from "tailwind-merge"
import { AdminBadge, type AdminBadgeVariant } from "@/src/components/admin/AdminBadge"
import {
  AdminTableEditLink,
  AdminTableExternalLink,
} from "@/src/components/admin/AdminTableActions"
import {
  tableBodyClassName,
  tableCellClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
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
      <TableWrapper className="mt-7">
        <div>
          <div className={tableHeadRowClassName}>
            <div className="grid grid-cols-8">
              <div className={twJoin(tableCellClassName, tableHeadCellClassName)}>
                <span className="sr-only">Status</span>
              </div>
              <div className={twJoin(tableCellClassName, tableHeadCellClassName)}>ID</div>
              <div className={twJoin(tableCellClassName, tableHeadCellClassName)}>Datum Email</div>
              <div className={twJoin(tableCellClassName, tableHeadCellClassName)}>
                Prozessiert am
              </div>
              <div className={twJoin(tableCellClassName, tableHeadCellClassName, "col-span-2")}>
                Titel
              </div>
              <div className={twJoin(tableCellClassName, tableHeadCellClassName)}>Projekt</div>
              <div className={twJoin(tableCellClassName, tableHeadCellClassName)}>Bestätigung</div>
            </div>
          </div>
          <div className={tableBodyClassName}>
            {projectRecords.length ? (
              projectRecords.map((projectRecord) => (
                <div
                  key={projectRecord.id}
                  className={twJoin("grid grid-cols-8", tableRowClassName)}
                >
                  <div className={twJoin(tableCellClassName, "text-sm text-gray-900")}>
                    <ProjectRecordEditingStateIndicator
                      editingState={projectRecord.editingState}
                      variant="table"
                    />
                  </div>
                  <div className={twJoin(tableCellClassName, "text-sm text-gray-900")}>
                    {projectRecord.id}
                  </div>
                  <div className={twJoin(tableCellClassName, "text-sm text-gray-900")}>
                    <TableDateTime value={projectRecord.date} />
                  </div>
                  <div className={twJoin(tableCellClassName, "text-sm text-gray-900")}>
                    <TableDateTime value={projectRecord.createdAt} />
                  </div>
                  <div
                    className={twJoin(
                      tableCellClassName,
                      "col-span-2 text-sm font-semibold text-blue-500",
                    )}
                  >
                    {projectRecord.title}
                  </div>
                  <div className={twJoin(tableCellClassName, "text-sm text-gray-900")}>
                    <AdminTableExternalLink href={`/${projectRecord.project.slug}/project-records`}>
                      {shortTitle(projectRecord.project.slug)}
                    </AdminTableExternalLink>
                  </div>
                  <div className={twJoin(tableCellClassName, "text-sm text-gray-900")}>
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
