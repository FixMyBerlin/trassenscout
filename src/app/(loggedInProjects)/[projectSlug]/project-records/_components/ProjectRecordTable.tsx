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
import { ChatBubbleBottomCenterTextIcon, DocumentIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { ProjectRecordAssignedToPill } from "./ProjectRecordAssignedToPill"
import { ProjectRecordTopicsList } from "./ProjectRecordTopicsList"

export const ProjectRecordsTable = ({
  projectRecords,
  openLinksInNewTab,
  highlightId,
  isTopicFilter,
  bleed = true,
}: {
  projectRecords:
    | Awaited<ReturnType<typeof getProjectRecords>>
    | Awaited<ReturnType<typeof getProjectRecordsByAcquisitionArea>>
    | Awaited<ReturnType<typeof getProjectRecordsBySubsubsection>>
  highlightId?: number | null
  isTopicFilter?: boolean
  bleed?: boolean
  openLinksInNewTab?: boolean
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
              {/* Small containers only show Datum/Titel/Dokumente */}
              <col className="w-[24%] @xl:w-[10%]" />
              <col className="w-[58%] @xl:w-[45%]" />
              <col className="hidden @xl:table-column @xl:w-[25%]" />
              <col className="hidden @xl:table-column @xl:w-[10%]" />
              <col className="w-[18%] @xl:w-[10%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50">
                <th scope="col" className={clsx(spaceClasses, "font-medium uppercase")}>
                  Datum
                </th>
                <th scope="col" className={clsx(spaceClasses, "font-medium uppercase")}>
                  Titel
                </th>
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
                      highlightId === projectRecord.id && "bg-green-50",
                    )}
                  >
                    <td className={clsx(spaceClasses, "align-top")}>
                      {projectRecord.date
                        ? format(new Date(projectRecord.date), "P", { locale: de })
                        : "—"}
                    </td>
                    <td className={clsx("align-top", spaceClasses)}>
                      <Link
                        className="w-full"
                        href={detailHref}
                        title={projectRecord.title}
                        blank={openLinksInNewTab}
                      >
                        {projectRecord.title}
                      </Link>
                    </td>
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
                        {projectRecord.uploads?.length ?? 0}
                      </span>
                      <span className="inline-flex items-center justify-end gap-1 text-xs">
                        <ChatBubbleBottomCenterTextIcon className="size-4 shrink-0" />
                        {/* @ts-ignore todo I am not sure why ts is complaining here   */}
                        {projectRecord.projectRecordComments?.length ?? 0}
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
