"use client"

import { useFilters } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/filter/useFilters.nuqs"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/core/components/links"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getProjectRecords from "@/src/server/projectRecords/queries/getProjectRecords"
import getProjectRecordsByAcquisitionArea from "@/src/server/projectRecords/queries/getProjectRecordsByAcquisitionArea"
import getProjectRecordsBySubsubsection from "@/src/server/projectRecords/queries/getProjectRecordsBySubsubsection"
import getProjectRecordsNeedsReview from "@/src/server/projectRecords/queries/getProjectRecordsNeedsReview"
import { ChatBubbleBottomCenterTextIcon, DocumentIcon } from "@heroicons/react/24/outline"
import { ProjectRecordEditingState } from "@prisma/client"
import clsx from "clsx"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { ProjectRecordAssignedToPill } from "./ProjectRecordAssignedToPill"
import { ProjectRecordEditingStateIndicator } from "./ProjectRecordEditingStateIndicator"
import { ProjectRecordTopicsList } from "./ProjectRecordTopicsList"

/**
 * Column width classes for `table-fixed` layout. Adjust percentages here only.
 * `default` = without Verhandlungsfläche; `withAcquisitionArea` = extra column on all breakpoints.
 */
const projectRecordTableColWidths = {
  editingState: "w-[6%] @xl:w-[3%]",
  date: {
    default: "w-[20%] @xl:w-[9%]",
    withAcquisitionArea: "w-[16%] @xl:w-[9%]",
  },
  title: {
    default: "w-[52%] @xl:w-[41%]",
    withAcquisitionArea: "min-w-0 w-[32%] @xl:w-[24%]",
  },
  acquisitionArea: "w-[28%] @xl:w-[14%]",
  tags: "hidden @xl:table-column @xl:w-[24%]",
  assignedTo: "hidden @xl:table-column @xl:w-[10%]",
  documents: "w-[18%] @xl:w-[10%]",
} as const

export const ProjectRecordsTable = ({
  projectRecords,
  highlightId,
  isTopicFilter,
  bleed = true,
  showAcquisitionAreaColumn = false,
}: {
  projectRecords:
    | Awaited<ReturnType<typeof getProjectRecords>>
    | Awaited<ReturnType<typeof getProjectRecordsByAcquisitionArea>>
    | Awaited<ReturnType<typeof getProjectRecordsBySubsubsection>>
    | Awaited<ReturnType<typeof getProjectRecordsNeedsReview>>
  highlightId?: number | null
  isTopicFilter?: boolean
  bleed?: boolean
  showAcquisitionAreaColumn?: boolean
}) => {
  const projectSlug = useProjectSlug()
  const { filter, setFilter } = useFilters()

  if (!projectRecords.length) return null
  const spaceClasses = "px-3 py-2"

  const handleTopicClick = (topic: string): void => {
    if (topic) setFilter({ ...filter, searchterm: topic })
  }

  const handleAssigneeClick = (assigneeSearchText: string): void => {
    if (assigneeSearchText) setFilter({ ...filter, searchterm: assigneeSearchText })
  }

  return (
    <>
      <TableWrapper bleed={bleed}>
        <div className="@container w-full">
          <table className="min-w-full table-fixed border-collapse text-left text-sm text-gray-700">
            <colgroup>
              <col className={projectRecordTableColWidths.editingState} />
              <col
                className={
                  showAcquisitionAreaColumn
                    ? projectRecordTableColWidths.date.withAcquisitionArea
                    : projectRecordTableColWidths.date.default
                }
              />
              <col
                className={
                  showAcquisitionAreaColumn
                    ? projectRecordTableColWidths.title.withAcquisitionArea
                    : projectRecordTableColWidths.title.default
                }
              />
              {showAcquisitionAreaColumn ? (
                <col className={projectRecordTableColWidths.acquisitionArea} />
              ) : null}
              <col className={projectRecordTableColWidths.tags} />
              <col className={projectRecordTableColWidths.assignedTo} />
              <col className={projectRecordTableColWidths.documents} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50">
                <th scope="col" className={clsx(spaceClasses, "sr-only font-medium")}>
                  Status
                </th>
                <th scope="col" className={clsx(spaceClasses, "font-medium uppercase")}>
                  Datum
                </th>
                <th scope="col" className={clsx(spaceClasses, "font-medium uppercase")}>
                  Titel
                </th>
                {showAcquisitionAreaColumn ? (
                  <th scope="col" className={clsx(spaceClasses, "font-medium uppercase")}>
                    Verhandlungsfläche
                  </th>
                ) : null}
                <th
                  scope="col"
                  className={clsx(spaceClasses, "hidden font-medium uppercase @xl:table-cell")}
                >
                  Tags
                </th>
                <th
                  scope="col"
                  className={clsx(spaceClasses, "hidden font-medium uppercase @xl:table-cell")}
                >
                  Zugewiesen
                </th>
                <th scope="col" className={clsx(spaceClasses, "sr-only")}>
                  Dokumente
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {projectRecords.map((projectRecord) => {
                const detailHref = projectRecordDetailRoute(projectSlug, projectRecord.id)

                return (
                  <tr
                    key={projectRecord.id}
                    className={clsx(
                      "border-b border-gray-100",
                      highlightId === projectRecord.id
                        ? "bg-green-50"
                        : projectRecord.editingState === ProjectRecordEditingState.COMPLETED &&
                            "bg-gray-50/90 text-gray-500",
                    )}
                  >
                    <td className={clsx(spaceClasses, "align-top")}>
                      <ProjectRecordEditingStateIndicator
                        editingState={projectRecord.editingState}
                        variant="table"
                      />
                    </td>
                    <td className={clsx(spaceClasses, "align-top")}>
                      {projectRecord.date
                        ? format(new Date(projectRecord.date), "P", { locale: de })
                        : "—"}
                    </td>
                    <td className={clsx("align-top", spaceClasses)}>
                      <Link
                        className="w-full"
                        href={detailHref}
                        scroll={false}
                        title={projectRecord.title}
                      >
                        {projectRecord.title}
                      </Link>
                    </td>
                    {showAcquisitionAreaColumn ? (
                      <td className={clsx("align-top wrap-break-word", spaceClasses)}>
                        {projectRecord.acquisitionArea?.id ?? "—"}
                      </td>
                    ) : null}
                    <td className={clsx("hidden align-top @xl:table-cell", spaceClasses)}>
                      <div className="flex items-center justify-between gap-2">
                        <ProjectRecordTopicsList
                          topics={projectRecord.projectRecordTopics}
                          isInteractive={isTopicFilter}
                          onTopicClick={handleTopicClick}
                        />
                      </div>
                    </td>
                    <td className={clsx("hidden align-top @xl:table-cell", spaceClasses)}>
                      <div className="flex items-center justify-start">
                        {projectRecord.assignedTo && (
                          <ProjectRecordAssignedToPill
                            assignedTo={projectRecord.assignedTo}
                            variant="list"
                            isInteractive={isTopicFilter}
                            onAssigneeClick={handleAssigneeClick}
                          />
                        )}
                      </div>
                    </td>
                    <td
                      className={clsx(
                        spaceClasses,
                        "flex items-center justify-end gap-2 tabular-nums @xl:gap-4",
                      )}
                    >
                      <span className="inline-flex items-center justify-end gap-1 text-xs">
                        <DocumentIcon className="size-4 shrink-0" />
                        {projectRecord.uploadCount}
                      </span>
                      <span className="inline-flex items-center justify-end gap-1 text-xs">
                        <ChatBubbleBottomCenterTextIcon className="size-4 shrink-0" />
                        {projectRecord.commentCount}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </TableWrapper>

      <SuperAdminLogData data={projectRecords} />
    </>
  )
}
