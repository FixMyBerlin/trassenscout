import { SparklesIcon } from "@heroicons/react/20/solid"
import { twJoin } from "tailwind-merge"
import {
  adminTableBodyClassName,
  adminTableCellClassName,
  adminTableCellRightClassName,
  adminTableCellSubtextClassName,
  adminTableClassName,
  adminTableHeaderClassName,
  adminTableHeaderRightClassName,
  adminTableHeadRowClassName,
} from "@/src/components/admin/adminListClasses"
import { AdminTableActions, AdminTableEditLink } from "@/src/components/admin/AdminTableActions"
import { Link } from "@/src/components/core/components/links/Link"
import { TableDateTime } from "@/src/components/core/components/Table/TableDateTime"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import type { ProjectRecordEmailWithRelations } from "@/src/server/projectRecordEmails/types"

type Props = {
  projectRecordEmails: ProjectRecordEmailWithRelations[]
}

export const ProjectRecordEmailsTable = ({ projectRecordEmails }: Props) => {
  if (!projectRecordEmails.length) {
    return (
      <div className="px-4">
        <ZeroCase visible name="Emails" />
        <Link to="/admin/project-record-emails/new" button icon="plus" className="mt-4">
          Erste E-Mail hinzufügen
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="px-4">
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="mb-2">
            <strong>Hinweis:</strong> Unverarbeitete E-Mails (gelb markiert) werden im Posteingang
            des Projekts mit Protokollvorlage und KI verarbeitet. <br />
            ‼️ E-Mails ohne zugeordnetes Projekt müssen zuerst einem Projekt zugeordnet werden.
          </p>
        </div>
      </div>

      <TableWrapper withTopBorder>
        <table className={adminTableClassName}>
          <thead>
            <tr className={adminTableHeadRowClassName}>
              <th className={adminTableHeaderClassName}>ID</th>
              <th className={adminTableHeaderClassName}>Email vom</th>
              <th className={adminTableHeaderClassName}>Erstellt am</th>
              <th className={adminTableHeaderClassName}>Projekt</th>
              <th className={adminTableHeaderClassName}>Von</th>
              <th className={adminTableHeaderClassName}>Betreff</th>
              <th className={adminTableHeaderClassName}>Protokolleinträge</th>
              <th className={adminTableHeaderClassName}>Dokumente</th>
              <th className={adminTableHeaderRightClassName}>Aktion</th>
            </tr>
          </thead>
          <tbody className={adminTableBodyClassName}>
            {projectRecordEmails.map((email) => (
              <tr
                key={email.id}
                className={
                  email.projectRecords.length === 0 && !email.discardedAt
                    ? "border-b border-gray-100 bg-yellow-50 hover:bg-yellow-100"
                    : "border-b border-gray-100 hover:bg-gray-50"
                }
              >
                <td className={adminTableCellClassName}>
                  <Link
                    to={`/admin/project-record-emails/${email.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {email.id}
                  </Link>
                </td>
                <td className={adminTableCellClassName}>
                  <TableDateTime value={email.date} />
                </td>
                <td className={adminTableCellClassName}>
                  <TableDateTime value={email.createdAt} />
                </td>
                <td className={adminTableCellClassName}>
                  {email.project ? (
                    <div className="space-y-1">
                      <Link to={`/${email.project.slug}/project-records`}>
                        {shortTitle(email.project.slug)}
                      </Link>
                      {email.project.aiEnabled === false && (
                        <p
                          className={twJoin(
                            adminTableCellSubtextClassName,
                            "font-medium text-amber-700",
                          )}
                        >
                          KI-E-Mail-Protokoll deaktiviert
                        </p>
                      )}
                    </div>
                  ) : (
                    "‼️ Kein Projekt zugeordnet"
                  )}
                </td>
                <td className={adminTableCellClassName}>{email.from || "—"}</td>
                <td className={adminTableCellClassName}>{email.subject || "—"}</td>
                <td className={adminTableCellClassName}>
                  {email.projectRecords.length > 0 ? (
                    <ul className="space-y-1">
                      {email.projectRecords.map((projectRecord) => (
                        <li key={projectRecord.id}>
                          <Link to={`/admin/project-records/${projectRecord.id}/edit`}>
                            {projectRecord.id}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={adminTableCellClassName}>
                  {email.uploads.length > 0
                    ? email.uploads.map((upload) => <p key={upload.id}>{upload.id}</p>)
                    : "—"}
                </td>
                <td className={adminTableCellRightClassName}>
                  <AdminTableActions>
                    {email.discardedAt ? (
                      <span className="text-gray-500">Verworfen</span>
                    ) : email.projectRecords.length === 0 &&
                      email.project &&
                      email.project.aiEnabled ? (
                      <AdminTableEditLink
                        to={`/${email.project.slug}/project-records/inbox?modalProjectRecordEmailId=${email.id}`}
                        icon={<SparklesIcon aria-hidden />}
                      >
                        Im Posteingang öffnen
                      </AdminTableEditLink>
                    ) : null}
                    <AdminTableEditLink to={`/admin/project-record-emails/${email.id}/edit`} />
                  </AdminTableActions>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>

      <div className="px-4">
        <Link to="/admin/project-record-emails/new" button icon="plus">
          Neue E-Mail manuell hinzufügen
        </Link>
      </div>
    </div>
  )
}
