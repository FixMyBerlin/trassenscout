import { ChatBubbleBottomCenterTextIcon, DocumentIcon } from "@heroicons/react/24/outline"
import { format } from "date-fns"
import { de } from "date-fns/locale/de"
import { twJoin } from "tailwind-merge"
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
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ProjectRecordAssignedToPill } from "@/src/components/project-records/ProjectRecordAssignedToPill"
import { ProjectRecordEditingStateIndicator } from "@/src/components/project-records/ProjectRecordEditingStateIndicator"
import { useProjectRecordModal } from "@/src/components/project-records/ProjectRecordModalHost"
import { ProjectRecordTagsList } from "@/src/components/project-records/ProjectRecordTagsList"
import { createProjectRecordFilterUrl } from "@/src/components/project-records/utils/filter/createFilterUrl"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import type { MyAssignedRecord } from "@/src/server/projectRecords/types"

type Props = {
  records: MyAssignedRecord[]
}

/** Column widths for `table-fixed`; the title column takes what is left. */
const assignedRecordsTableColWidths = {
  editingState: "w-[6%] @xl:w-[3%]",
  date: "w-[24%] @xl:w-[13%]",
  title: "w-[50%] @xl:w-auto",
  project: "hidden @xl:table-column @xl:w-[12%]",
  tags: "hidden @xl:table-column @xl:w-[16%]",
  assignedTo: "hidden @xl:table-column @xl:w-[17%]",
  documents: "w-[20%] @xl:w-[10%]",
} as const

const dateOrDash = (value: Date | null) =>
  value ? format(value, "P", { locale: de }) : <span className="text-gray-400">–</span>

export const AssignedRecordsTable = ({ records }: Props) => {
  const { getProjectRecordDetailHref } = useProjectRecordModal()

  if (!records.length) {
    return <p className="px-4 text-sm text-gray-500">Keine Aufgaben für diese Auswahl.</p>
  }

  return (
    <TableWrapper>
      <div className="@container w-full">
        <table className={tableFixedClassName}>
          <colgroup>
            <col className={assignedRecordsTableColWidths.editingState} />
            <col className={assignedRecordsTableColWidths.date} />
            <col className={assignedRecordsTableColWidths.title} />
            <col className={assignedRecordsTableColWidths.project} />
            <col className={assignedRecordsTableColWidths.tags} />
            <col className={assignedRecordsTableColWidths.assignedTo} />
            <col className={assignedRecordsTableColWidths.documents} />
          </colgroup>
          <thead>
            <tr className={tableHeadRowClassName}>
              <th scope="col" className={twJoin(tableHeadCellClassName, "sr-only")}>
                Status
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Datum
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Titel
              </th>
              <th scope="col" className={twJoin(tableHeadCellClassName, "hidden @xl:table-cell")}>
                Projekt
              </th>
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
            {records.map((record) => (
              <tr
                key={record.id}
                className={twJoin(
                  tableRowClassName,
                  record.editingState === ProjectRecordEditingState.COMPLETED &&
                    "bg-gray-50/90 text-gray-500",
                )}
              >
                <td className={twJoin(tableCellClassName, "align-top")}>
                  <ProjectRecordEditingStateIndicator
                    editingState={record.editingState}
                    variant="table"
                  />
                </td>
                <td className={twJoin(tableCellClassName, "align-top leading-tight")}>
                  {dateOrDash(record.date)}
                  <br />
                  <span className="text-xs text-gray-500">
                    {record.assignedAt ? (
                      <>zugewiesen am {format(record.assignedAt, "P", { locale: de })}</>
                    ) : (
                      "Zuweisung unbekannt"
                    )}
                  </span>
                </td>
                <td className={twJoin(tableCellClassName, "align-top")}>
                  {/* Opens over the list, the same way an entry opens from a Maßnahme. */}
                  <Link
                    className="w-full"
                    to={getProjectRecordDetailHref({
                      projectRecordId: record.id,
                      forProjectSlug: record.project.slug,
                    })}
                    resetScroll={false}
                    title={record.title}
                  >
                    {record.title}
                  </Link>
                </td>
                <td className={twJoin(tableCellClassName, "hidden align-top @xl:table-cell")}>
                  <Link to="/$projectSlug" params={{ projectSlug: record.project.slug }}>
                    {shortTitle(record.project.slug)}
                  </Link>
                </td>
                <td className={twJoin(tableCellClassName, "hidden align-top @xl:table-cell")}>
                  <ProjectRecordTagsList
                    tags={record.tags}
                    getTagHref={(tag) =>
                      createProjectRecordFilterUrl(record.project.slug, { searchterm: tag })
                    }
                  />
                </td>
                <td
                  className={twJoin(tableCellClassName, "hidden min-w-0 align-top @xl:table-cell")}
                >
                  <div className="flex max-w-full min-w-0 items-center">
                    {record.assignedTo && (
                      <ProjectRecordAssignedToPill assignedTo={record.assignedTo} variant="list" />
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
                    {record._count.uploads}
                  </span>
                  <span className="inline-flex items-center justify-end gap-1 text-xs">
                    <ChatBubbleBottomCenterTextIcon className="size-4 shrink-0" />
                    {record._count.projectRecordComments}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableWrapper>
  )
}
