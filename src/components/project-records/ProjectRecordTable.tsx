import { ChatBubbleBottomCenterTextIcon, PaperClipIcon } from "@heroicons/react/24/outline"
import { getRouteApi } from "@tanstack/react-router"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { twJoin } from "tailwind-merge"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { SortableTableHeader } from "@/src/components/core/components/Table/SortableTableHeader"
import {
  tableBodyClassName,
  tableCellClassName,
  tableColumnTiers,
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
import {
  PROJECT_RECORD_TABLE_DEFAULT_SORT,
  type ProjectRecordTableSortColumn,
} from "@/src/shared/projectRecords/searchSchemas"
import { sortRows } from "@/src/shared/tableSort/sortRows"
import type { TableSort } from "@/src/shared/tableSort/tableSort"
import { ProjectRecordAssignedToPill } from "./ProjectRecordAssignedToPill"
import { ProjectRecordEditingStateIndicator } from "./ProjectRecordEditingStateIndicator"
import { useProjectRecordModal } from "./ProjectRecordModalHost"
import { projectRecordSortValues } from "./projectRecordTableSort"
import { ProjectRecordTagsList } from "./ProjectRecordTagsList"
import { ProjectRecordVerknuepfungen } from "./ProjectRecordVerknuepfungen"
import { createProjectRecordFilterUrl } from "./utils/filter/createFilterUrl"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

// Columns without a width (Titel, Verknüpfungen, Tags) share what the fixed ones leave.
const projectRecordTableColWidths = {
  editingState: "w-8",
  date: "w-24",
  relations: tableColumnTiers.from768.col,
  tags: tableColumnTiers.from576.col,
  assignedTo: `${tableColumnTiers.from576.col} w-36`,
  documents: "w-14 @4xl:w-24",
} as const

export const ProjectRecordsTable = ({
  projectRecords,
  highlightId,
  isTopicFilter,
  showRelationsColumn = false,
  withTopBorder = false,
  sort,
  onSortClick,
  onTopicClick,
  onAssigneeClick,
}: {
  projectRecords: (
    | ProjectRecordsList[number]
    | ProjectRecordsByAcquisitionArea[number]
    | ProjectRecordsBySubsubsection[number]
    | ProjectRecordsNeedsReviewList[number]
  )[]
  highlightId?: number | null
  isTopicFilter?: boolean
  showRelationsColumn?: boolean
  withTopBorder?: boolean
  // Without `sort`, rows keep the given order
  sort?: TableSort<ProjectRecordTableSortColumn>
  onSortClick?: (column: ProjectRecordTableSortColumn) => void
  onTopicClick?: (topic: string) => void
  onAssigneeClick?: (assigneeSearchText: string) => void
}) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const projectRecordModal = useProjectRecordModal()

  if (!projectRecords.length) return null

  const sortedProjectRecords = sort
    ? sortRows(projectRecords, projectRecordSortValues, sort, PROJECT_RECORD_TABLE_DEFAULT_SORT)
    : projectRecords

  return (
    <>
      <TableWrapper withTopBorder={withTopBorder}>
        <div className="@container w-full">
          <table className={twJoin(tableFixedClassName, "w-full")}>
            <colgroup>
              <col className={projectRecordTableColWidths.editingState} />
              <col className={projectRecordTableColWidths.date} />
              <col />
              {showRelationsColumn && <col className={projectRecordTableColWidths.relations} />}
              <col className={projectRecordTableColWidths.tags} />
              <col className={projectRecordTableColWidths.assignedTo} />
              <col className={projectRecordTableColWidths.documents} />
            </colgroup>
            <thead>
              <tr className={tableHeadRowClassName}>
                <th scope="col" className={tableHeadCellClassName}>
                  <span className="sr-only">Status</span>
                </th>
                <SortableTableHeader column="date" sort={sort} onSortClick={onSortClick}>
                  Datum
                </SortableTableHeader>
                <SortableTableHeader column="title" sort={sort} onSortClick={onSortClick}>
                  Titel
                </SortableTableHeader>
                {showRelationsColumn && (
                  <th
                    scope="col"
                    className={twJoin(tableHeadCellClassName, tableColumnTiers.from768.cell)}
                  >
                    Verknüpfungen
                  </th>
                )}
                <th
                  scope="col"
                  className={twJoin(tableHeadCellClassName, tableColumnTiers.from576.cell)}
                >
                  Tags
                </th>
                <SortableTableHeader
                  column="assignedTo"
                  sort={sort}
                  onSortClick={onSortClick}
                  className={twJoin(tableHeadCellClassName, tableColumnTiers.from576.cell)}
                >
                  Zugewiesen
                </SortableTableHeader>
                <th scope="col" className={tableHeadCellClassName}>
                  <span className="sr-only">Anzahl</span>
                </th>
              </tr>
            </thead>
            <tbody className={tableBodyClassName}>
              {sortedProjectRecords.map((projectRecord) => {
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
                    <td className={twJoin(tableCellClassName, "pr-0 align-top")}>
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
                    <td
                      className={twJoin(
                        "align-top wrap-break-word hyphens-auto",
                        tableCellClassName,
                      )}
                    >
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
                    {showRelationsColumn && (
                      <td
                        className={twJoin(
                          "align-top wrap-break-word hyphens-auto",
                          tableColumnTiers.from768.cell,
                          tableCellClassName,
                        )}
                      >
                        <ProjectRecordVerknuepfungen
                          projectSlug={projectSlug}
                          landAcquisitionModuleEnabled={landAcquisitionEnabled}
                          subsubsection={relationSubsubsection}
                          subsubsections={relationSubsubsections}
                          acquisitionArea={relationAcquisitionArea}
                          acquisitionAreas={relationAcquisitionAreas}
                        />
                      </td>
                    )}
                    <td
                      className={twJoin(
                        "align-top wrap-anywhere hyphens-auto",
                        tableColumnTiers.from576.cell,
                        tableCellClassName,
                      )}
                    >
                      <ProjectRecordTagsList
                        tags={projectRecordTags}
                        isInteractive={isTopicFilter}
                        onTagClick={onTopicClick}
                        getTagHref={(tag) => createProjectRecordFilterUrl(projectSlug, { tag })}
                      />
                    </td>
                    <td
                      className={twJoin(
                        "min-w-0 align-top",
                        tableColumnTiers.from576.cell,
                        tableCellClassName,
                      )}
                    >
                      <div className="flex max-w-full min-w-0 items-center">
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
                    <td className={twJoin(tableCellClassName, "pl-0 align-top")}>
                      <div className="flex flex-col gap-1 text-xs tabular-nums @4xl:flex-row @4xl:gap-3">
                        <span className="flex items-center gap-1">
                          <PaperClipIcon className="size-4 shrink-0" />
                          <span className="sr-only">Dokumente: </span>
                          {uploadCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleBottomCenterTextIcon className="size-4 shrink-0" />
                          <span className="sr-only">Anmerkungen: </span>
                          {commentCount}
                        </span>
                      </div>
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
