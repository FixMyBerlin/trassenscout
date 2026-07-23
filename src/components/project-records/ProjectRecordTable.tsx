import { ChatBubbleBottomCenterTextIcon, DocumentIcon } from "@heroicons/react/24/outline"
import { getRouteApi } from "@tanstack/react-router"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { twJoin } from "tailwind-merge"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import {
  tableBodyClassName,
  tableCellClassName,
  tableFixedClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import type {
  ProjectRecordsByAcquisitionArea,
  ProjectRecordsBySubsubsection,
  ProjectRecordsList,
  ProjectRecordsNeedsReviewList,
} from "@/src/server/projectRecords/types"
import { ProjectRecordAssignedToPill } from "./ProjectRecordAssignedToPill"
import { ProjectRecordEditingStateIndicator } from "./ProjectRecordEditingStateIndicator"
import { useProjectRecordModal } from "./ProjectRecordModalHost"
import { ProjectRecordTagsList } from "./ProjectRecordTagsList"
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
  showAcquisitionAreaColumn = false,
  showRelationsColumn = false,
  withTopBorder = false,
  onTopicClick,
  onAssigneeClick,
}: {
  projectRecords:
    | ProjectRecordsList
    | ProjectRecordsByAcquisitionArea
    | ProjectRecordsBySubsubsection
    | ProjectRecordsNeedsReviewList
  highlightId?: number | null
  isTopicFilter?: boolean
  showAcquisitionAreaColumn?: boolean
  showRelationsColumn?: boolean
  withTopBorder?: boolean
  onTopicClick?: (topic: string) => void
  onAssigneeClick?: (assigneeSearchText: string) => void
}) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const projectRecordModal = useProjectRecordModal()

  if (!projectRecords.length) return null

  return (
    <>
      <TableWrapper withTopBorder={withTopBorder}>
        <div className="@container w-full">
          <table className={tableFixedClassName}>
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
              <tr className={tableHeadRowClassName}>
                <th scope="col" className={twJoin(tableHeadCellClassName, "sr-only")}>
                  Status
                </th>
                <th scope="col" className={twJoin(tableHeadCellClassName)}>
                  Datum
                </th>
                <th scope="col" className={twJoin(tableHeadCellClassName)}>
                  Titel
                </th>
                {showAcquisitionAreaColumn ? (
                  <th scope="col" className={twJoin(tableHeadCellClassName)}>
                    Verhandlungsfläche
                  </th>
                ) : showRelationsColumn ? (
                  <th
                    scope="col"
                    className={twJoin(tableHeadCellClassName, "hidden @xl:table-cell")}
                  >
                    Verknüpfungen
                  </th>
                ) : null}
                <th scope="col" className={twJoin(tableHeadCellClassName, "hidden @xl:table-cell")}>
                  Tags
                </th>
                <th scope="col" className={twJoin(tableHeadCellClassName, "hidden @xl:table-cell")}>
                  Zugewiesen
                </th>
                <th scope="col" className={twJoin(tableHeadCellClassName, "sr-only")}>
                  Dokumente
                </th>
              </tr>
            </thead>
            <tbody className={tableBodyClassName}>
              {projectRecords.map((projectRecord) => {
                const acquisitionAreaId =
                  "acquisitionArea" in projectRecord && projectRecord.acquisitionArea
                    ? projectRecord.acquisitionArea.id
                    : projectRecord.acquisitionAreaId
                const projectRecordTags = "tags" in projectRecord ? projectRecord.tags : []
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
                      tableRowClassName,
                      highlightId === projectRecord.id
                        ? "bg-green-50"
                        : projectRecord.editingState === ProjectRecordEditingState.COMPLETED &&
                            "bg-gray-50/90 text-gray-500",
                    )}
                  >
                    <td className={twJoin(tableCellClassName, "align-top")}>
                      <ProjectRecordEditingStateIndicator
                        editingState={projectRecord.editingState}
                        variant="table"
                      />
                    </td>
                    <td className={twJoin(tableCellClassName, "align-top")}>
                      {projectRecord.date
                        ? format(new Date(projectRecord.date), "P", { locale: de })
                        : "—"}
                    </td>
                    <td className={twJoin("align-top", tableCellClassName)}>
                      <Link
                        className="w-full"
                        to={projectRecordModal.getProjectRecordDetailHref({
                          projectRecordId: projectRecord.id,
                        })}
                        resetScroll={false}
                        title={projectRecord.title}
                      >
                        {projectRecord.title}
                      </Link>
                    </td>
                    {showAcquisitionAreaColumn ? (
                      <td className={twJoin("align-top wrap-break-word", tableCellClassName)}>
                        {acquisitionAreaId ?? "—"}
                      </td>
                    ) : showRelationsColumn ? (
                      <td className={twJoin("hidden align-top @xl:table-cell", tableCellClassName)}>
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
                    <td className={twJoin("hidden align-top @xl:table-cell", tableCellClassName)}>
                      <div className="flex items-center justify-between gap-2">
                        <ProjectRecordTagsList
                          tags={projectRecordTags}
                          isInteractive={isTopicFilter}
                          onTagClick={onTopicClick}
                        />
                      </div>
                    </td>
                    <td className={twJoin("hidden align-top @xl:table-cell", tableCellClassName)}>
                      <div className="flex items-center justify-start">
                        {assignedTo && (
                          <ProjectRecordAssignedToPill
                            assignedTo={assignedTo}
                            variant="list"
                            isInteractive={isTopicFilter}
                            onAssigneeClick={onAssigneeClick}
                          />
                        )}
                      </div>
                    </td>
                    <td
                      className={twJoin(
                        tableCellClassName,
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
