"use client"

import { Link } from "@/src/core/components/links"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/core/components/text"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { AdminProjectRecordWithRelations } from "@/src/server/projectRecords/queries/getAllProjectRecordsAdmin"
import { ProjectRecordReviewState } from "@prisma/client"
import clsx from "clsx"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export const ProjectRecordReviewStatePill = ({ state }: { state: ProjectRecordReviewState }) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-xs font-medium",
      {
        [ProjectRecordReviewState.NEEDSREVIEW]: "border-yellow-200 bg-yellow-100 text-yellow-800",
        [ProjectRecordReviewState.NEEDSADMINREVIEW]:
          "border-yellow-200 bg-yellow-300 text-yellow-800",
        [ProjectRecordReviewState.REJECTED]: "border-red-200 bg-red-100 text-red-800",
        [ProjectRecordReviewState.APPROVED]: "border-green-200 bg-green-100 text-gray-800",
      }[state],
    )}
  >
    {state === ProjectRecordReviewState.NEEDSREVIEW && "Benötigt Review"}
    {state === ProjectRecordReviewState.NEEDSADMINREVIEW && "Benötigt Admin-Review"}
    {state === ProjectRecordReviewState.REJECTED && "Abgelehnt"}
    {state === ProjectRecordReviewState.APPROVED && "Genehmigt"}
  </span>
)

export const AdminProjectRecordsTable = ({
  projectRecords,
}: {
  projectRecords: AdminProjectRecordWithRelations[]
}) => {
  const spaceClasses = "px-3 py-2"

  return (
    <>
      <TableWrapper className="mt-7">
        <div className="min-w-full divide-y divide-gray-300">
          <div className="bg-gray-50">
            <div className="grid grid-cols-7">
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold text-gray-900 uppercase",
                )}
              >
                ID
              </div>
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold text-gray-900 uppercase",
                )}
              >
                Datum Email
              </div>
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold text-gray-900 uppercase",
                )}
              >
                Prozessiert am
              </div>
              <div
                className={clsx(
                  spaceClasses,
                  "col-span-2 text-left text-sm font-semibold text-gray-900 uppercase",
                )}
              >
                Titel
              </div>
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold text-gray-900 uppercase",
                )}
              >
                Projekt
              </div>
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold text-gray-900 uppercase",
                )}
              >
                Review
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 bg-white">
            {!!projectRecords.length ? (
              projectRecords.map((projectRecord) => (
                <div key={projectRecord.id} className="grid grid-cols-7">
                  <div className={clsx(spaceClasses, "text-sm text-gray-900")}>
                    {projectRecord.id}
                  </div>
                  <div className={clsx(spaceClasses, "text-sm text-gray-900")}>
                    {projectRecord.date
                      ? format(new Date(projectRecord.date), "dd. MMMM yyyy, HH:mm", { locale: de })
                      : "—"}
                  </div>
                  <div className={clsx(spaceClasses, "text-sm text-gray-900")}>
                    {projectRecord.createdAt
                      ? format(new Date(projectRecord.createdAt), "dd. MMMM yyyy, HH:mm", {
                          locale: de,
                        })
                      : "—"}
                  </div>
                  <div
                    className={clsx(spaceClasses, "col-span-2 text-sm font-semibold text-blue-500")}
                  >
                    {projectRecord.title}
                  </div>
                  <div className={clsx(spaceClasses, "text-sm text-gray-900")}>
                    <Link blank href={`/${projectRecord.project.slug}/project-records`}>
                      {shortTitle(projectRecord.project.slug)}
                    </Link>
                  </div>
                  <div className={clsx(spaceClasses, "text-sm text-gray-900")}>
                    <div className="flex flex-col gap-1">
                      <ProjectRecordReviewStatePill state={projectRecord.reviewState} />
                      <Link
                        blank
                        href={`/admin/project-records/${projectRecord.id}/edit`}
                        className="text-blue-500 hover:underline"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <ZeroCase visible={projectRecords.length} name="Protokolle" />
            )}
          </div>
        </div>
      </TableWrapper>
    </>
  )
}
