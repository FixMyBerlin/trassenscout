import { ChatBubbleLeftIcon, PaperClipIcon } from "@heroicons/react/20/solid"
import { format } from "date-fns"
import { de } from "date-fns/locale/de"
import { Link } from "@/src/components/core/components/links/Link"
import {
  tableBodyClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import { ProjectRecordEditingStateIndicator } from "@/src/components/project-records/ProjectRecordEditingStateIndicator"
import { useProjectRecordModal } from "@/src/components/project-records/ProjectRecordModalHost"
import { ProjectRecordTagsList } from "@/src/components/project-records/ProjectRecordTagsList"
import type { MyAssignedRecord } from "@/src/server/projectRecords/types"

type Props = {
  records: MyAssignedRecord[]
  /** Hidden for someone who only belongs to one project — the column would say nothing. */
  showProject: boolean
}

const dateOrDash = (value: Date | null) =>
  value ? format(value, "P", { locale: de }) : <span className="text-gray-400">–</span>

export const AssignedRecordsTable = ({ records, showProject }: Props) => {
  const { getProjectRecordDetailHref } = useProjectRecordModal()

  if (!records.length) {
    return <p className="px-4 text-sm text-gray-500">Keine Aufgaben für diese Auswahl.</p>
  }

  return (
    <TableWrapper withTopBorder>
      <table className={tableClassName}>
        <thead>
          <tr className={tableHeadRowClassName}>
            <th scope="col" className={tableHeadCellClassName}>
              <span className="sr-only">Status</span>
            </th>
            <th scope="col" className={tableHeadCellClassName}>
              Datum
            </th>
            <th scope="col" className={tableHeadCellClassName}>
              Titel
            </th>
            {showProject ? (
              <th scope="col" className={tableHeadCellClassName}>
                Projekt
              </th>
            ) : null}
            <th scope="col" className={tableHeadCellClassName}>
              Tags
            </th>
            <th scope="col" className={tableHeadCellClassName}>
              Zugewiesen
            </th>
            <th scope="col" className={tableHeadCellClassName}>
              <span className="sr-only">Dokumente und Kommentare</span>
            </th>
          </tr>
        </thead>

        <tbody className={tableBodyClassName}>
          {records.map((record) => (
            <tr key={record.id} className={tableRowClassName}>
              <td className="py-4 pr-2 pl-4 align-top sm:pl-6">
                <ProjectRecordEditingStateIndicator
                  editingState={record.editingState}
                  variant="table"
                />
              </td>
              <td className="px-3 py-4 align-top text-sm leading-tight text-gray-700">
                {dateOrDash(record.date)}
                <br />
                <span className="text-xs text-gray-500">
                  {record.assignedAt ? (
                    <>zugewiesen {format(record.assignedAt, "P", { locale: de })}</>
                  ) : (
                    "Zuweisung unbekannt"
                  )}
                </span>
              </td>
              <td className="px-3 py-4 align-top text-sm">
                {/* Opens over the list, the same way an entry opens from a Maßnahme. */}
                <Link
                  to={getProjectRecordDetailHref({
                    projectRecordId: record.id,
                    forProjectSlug: record.project.slug,
                  })}
                  resetScroll={false}
                >
                  {record.title}
                </Link>
              </td>
              {showProject ? (
                <td className="px-3 py-4 align-top text-sm">
                  <Link to="/$projectSlug" params={{ projectSlug: record.project.slug }}>
                    {shortTitle(record.project.slug)}
                  </Link>
                </td>
              ) : null}
              <td className="px-3 py-4 align-top text-sm">
                <ProjectRecordTagsList tags={record.tags} />
              </td>
              <td className="px-3 py-4 align-top text-sm text-gray-700">
                {record.assignedTo ? (
                  getFullnameWithInstitution(record.assignedTo)
                ) : (
                  <span className="text-gray-400">–</span>
                )}
              </td>
              <td className="py-4 pr-4 pl-3 align-top text-sm text-gray-500 sm:pr-6">
                <span className="flex items-center gap-3">
                  {record._count.uploads > 0 ? (
                    <span className="flex items-center gap-1" title="Dokumente">
                      <PaperClipIcon className="size-4" aria-hidden />
                      {record._count.uploads}
                    </span>
                  ) : null}
                  {record._count.projectRecordComments > 0 ? (
                    <span className="flex items-center gap-1" title="Anmerkungen">
                      <ChatBubbleLeftIcon className="size-4" aria-hidden />
                      {record._count.projectRecordComments}
                    </span>
                  ) : null}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  )
}
