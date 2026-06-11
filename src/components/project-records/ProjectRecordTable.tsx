import { ChatBubbleBottomCenterTextIcon, DocumentIcon } from "@heroicons/react/24/outline"
import { getRouteApi } from "@tanstack/react-router"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { twJoin } from "tailwind-merge"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { useProjectRecordFilters } from "@/src/components/project-records/utils/useProjectRecordFilters"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import type {
  ProjectRecordsByAcquisitionArea,
  ProjectRecordsBySubsubsection,
  ProjectRecordsList,
  ProjectRecordsNeedsReviewList,
} from "@/src/server/projectRecords/types"
import { ProjectRecordAssignedToPill } from "./ProjectRecordAssignedToPill"
import { ProjectRecordEditingStateIndicator } from "./ProjectRecordEditingStateIndicator"
import { ProjectRecordTopicsList } from "./ProjectRecordTopicsList"
import { ProjectRecordVerknuepfungen } from "./ProjectRecordVerknuepfungen"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

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
  relations: "hidden @xl:table-column @xl:w-[24%]",
  assignedTo: "hidden @xl:table-column @xl:w-[10%]",
  documents: "w-[18%] @xl:w-[10%]",
} as const

export const ProjectRecordsTable = ({
  projectRecords,
  highlightId,
  isTopicFilter,
  bleed = true,
  showAcquisitionAreaColumn = false,
  showRelationsColumn = false,
}: {
  projectRecords:
    | ProjectRecordsList
    | ProjectRecordsByAcquisitionArea
    | ProjectRecordsBySubsubsection
    | ProjectRecordsNeedsReviewList
  highlightId?: number | null
  isTopicFilter?: boolean
  bleed?: boolean
  showAcquisitionAreaColumn?: boolean
  showRelationsColumn?: boolean
}) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { filter, setFilter } = useProjectRecordFilters()

  if (!projectRecords.length) return null
  const spaceClasses = "px-3 py-2"

  const handleTopicClick = (topic: string) => {
    if (topic) setFilter({ ...filter, searchterm: topic })
  }

  const handleAssigneeClick = (assigneeSearchText: string) => {
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
              ) : showRelationsColumn ? (
                <col className={projectRecordTableColWidths.relations} />
              ) : null}
              <col className={projectRecordTableColWidths.tags} />
              <col className={projectRecordTableColWidths.assignedTo} />
              <col className={projectRecordTableColWidths.documents} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50">
                <th scope="col" className={twJoin(spaceClasses, "sr-only font-medium")}>
                  Status
                </th>
                <th scope="col" className={twJoin(spaceClasses, "font-medium uppercase")}>
                  Datum
                </th>
                <th scope="col" className={twJoin(spaceClasses, "font-medium uppercase")}>
                  Titel
                </th>
                {showAcquisitionAreaColumn ? (
                  <th scope="col" className={twJoin(spaceClasses, "font-medium uppercase")}>
                    Verhandlungsfläche
                  </th>
                ) : showRelationsColumn ? (
                  <th
                    scope="col"
                    className={twJoin(spaceClasses, "hidden font-medium uppercase @xl:table-cell")}
                  >
                    Verknüpfungen
                  </th>
                ) : null}
                <th
                  scope="col"
                  className={twJoin(spaceClasses, "hidden font-medium uppercase @xl:table-cell")}
                >
                  Tags
                </th>
                <th
                  scope="col"
                  className={twJoin(spaceClasses, "hidden font-medium uppercase @xl:table-cell")}
                >
                  Zugewiesen
                </th>
                <th scope="col" className={twJoin(spaceClasses, "sr-only")}>
                  Dokumente
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {projectRecords.map((projectRecord) => {
                const acquisitionAreaId =
                  "acquisitionArea" in projectRecord && projectRecord.acquisitionArea
                    ? projectRecord.acquisitionArea.id
                    : projectRecord.acquisitionAreaId
                const projectRecordTopics =
                  "projectRecordTopics" in projectRecord ? projectRecord.projectRecordTopics : []
                const assignedTo = "assignedTo" in projectRecord ? projectRecord.assignedTo : null
                const uploadCount =
                  "uploadCount" in projectRecord
                    ? projectRecord.uploadCount
                    : "uploads" in projectRecord
                      ? projectRecord.uploads.length
                      : 0
                const commentCount =
                  "commentCount" in projectRecord
                    ? projectRecord.commentCount
                    : "projectRecordComments" in projectRecord
                      ? projectRecord.projectRecordComments.length
                      : 0
                const relationSubsubsection =
                  "subsubsection" in projectRecord ? projectRecord.subsubsection : null
                const relationSubsubsections =
                  "subsubsections" in projectRecord && Array.isArray(projectRecord.subsubsections)
                    ? projectRecord.subsubsections
                    : []
                const relationAcquisitionArea =
                  "acquisitionArea" in projectRecord &&
                  projectRecord.acquisitionArea &&
                  "subsubsection" in projectRecord.acquisitionArea &&
                  "parcel" in projectRecord.acquisitionArea
                    ? projectRecord.acquisitionArea
                    : null
                const relationAcquisitionAreas =
                  "acquisitionAreas" in projectRecord &&
                  Array.isArray(projectRecord.acquisitionAreas)
                    ? projectRecord.acquisitionAreas
                    : []
                const landAcquisitionEnabled =
                  "project" in projectRecord
                    ? "landAcquisitionModuleEnabled" in projectRecord.project
                      ? !!projectRecord.project.landAcquisitionModuleEnabled
                      : false
                    : false

                return (
                  <tr
                    key={projectRecord.id}
                    className={twJoin(
                      "border-b border-gray-100",
                      highlightId === projectRecord.id
                        ? "bg-green-50"
                        : projectRecord.editingState === ProjectRecordEditingState.COMPLETED &&
                            "bg-gray-50/90 text-gray-500",
                    )}
                  >
                    <td className={twJoin(spaceClasses, "align-top")}>
                      <ProjectRecordEditingStateIndicator
                        editingState={projectRecord.editingState}
                        variant="table"
                      />
                    </td>
                    <td className={twJoin(spaceClasses, "align-top")}>
                      {projectRecord.date
                        ? format(new Date(projectRecord.date), "P", { locale: de })
                        : "—"}
                    </td>
                    <td className={twJoin("align-top", spaceClasses)}>
                      <Link
                        className="w-full"
                        to="/$projectSlug/project-records/$projectRecordId"
                        params={{
                          projectSlug,
                          projectRecordId: String(projectRecord.id),
                        }}
                        resetScroll={false}
                        title={projectRecord.title}
                      >
                        {projectRecord.title}
                      </Link>
                    </td>
                    {showAcquisitionAreaColumn ? (
                      <td className={twJoin("align-top wrap-break-word", spaceClasses)}>
                        {acquisitionAreaId ?? "—"}
                      </td>
                    ) : showRelationsColumn ? (
                      <td className={twJoin("hidden align-top @xl:table-cell", spaceClasses)}>
                        <ProjectRecordVerknuepfungen
                          projectSlug={projectSlug}
                          landAcquisitionModuleEnabled={landAcquisitionEnabled}
                          subsubsection={relationSubsubsection}
                          subsubsections={relationSubsubsections}
                          acquisitionArea={relationAcquisitionArea}
                          acquisitionAreas={relationAcquisitionAreas}
                        />
                      </td>
                    ) : null}
                    <td className={twJoin("hidden align-top @xl:table-cell", spaceClasses)}>
                      <div className="flex items-center justify-between gap-2">
                        <ProjectRecordTopicsList
                          topics={projectRecordTopics}
                          isInteractive={isTopicFilter}
                          onTopicClick={handleTopicClick}
                        />
                      </div>
                    </td>
                    <td className={twJoin("hidden align-top @xl:table-cell", spaceClasses)}>
                      <div className="flex items-center justify-start">
                        {assignedTo && (
                          <ProjectRecordAssignedToPill
                            assignedTo={assignedTo}
                            variant="list"
                            isInteractive={isTopicFilter}
                            onAssigneeClick={handleAssigneeClick}
                          />
                        )}
                      </div>
                    </td>
                    <td
                      className={twJoin(
                        spaceClasses,
                        "flex items-center justify-end gap-2 tabular-nums @xl:gap-4",
                      )}
                    >
                      <span className="inline-flex items-center justify-end gap-1 text-xs">
                        <DocumentIcon className="size-4 shrink-0" />
                        {uploadCount}
                      </span>
                      <span className="inline-flex items-center justify-end gap-1 text-xs">
                        <ChatBubbleBottomCenterTextIcon className="size-4 shrink-0" />
                        {commentCount}
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
