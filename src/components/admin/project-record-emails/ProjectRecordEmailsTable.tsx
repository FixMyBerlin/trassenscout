import { SparklesIcon } from "@heroicons/react/20/solid"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { clsx } from "clsx"
import { useState } from "react"
import {
  adminTableCellClassName,
  adminTableCellRightClassName,
  adminTableCellSubtextClassName,
  adminTableClassName,
  adminTableHeaderClassName,
  adminTableHeaderRightClassName,
  adminTableWrapperClassName,
} from "@/src/components/admin/adminListClasses"
import {
  AdminTableActions,
  AdminTableEditLink,
  AdminTablePrimaryButton,
} from "@/src/components/admin/AdminTableActions"
import { Link } from "@/src/components/core/components/links/Link"
import { TableDateTime } from "@/src/components/core/components/Table/TableDateTime"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { processProjectRecordEmailFn } from "@/src/server/projectRecordEmails/projectRecordEmails.functions"
import type { ProjectRecordEmailWithRelations } from "@/src/server/projectRecordEmails/types"

type Props = {
  projectRecordEmails: ProjectRecordEmailWithRelations[]
}

export const ProjectRecordEmailsTable = ({ projectRecordEmails }: Props) => {
  const [processing, setProcessing] = useState<number | null>(null)
  const navigate = useNavigate()

  const processEmailMutation = useMutation({ mutationFn: processProjectRecordEmailFn })

  const handleProcessEmail = async (projectRecordEmailId: number) => {
    setProcessing(projectRecordEmailId)
    try {
      const result = await processEmailMutation.mutateAsync({ data: { projectRecordEmailId } })

      const message = `Protokolleintrag erfolgreich erstellt! ID: ${result.projectRecordId}`
      const documentsMessage = result.uploadIds?.length
        ? `\nDokumente mit den IDs: ${result.uploadIds.join(", ")} erstellt und verknüpft.`
        : ""
      const aiDisabledMessage =
        result.isAiEnabled === false
          ? "\nHinweis: KI-Unterstützung ist für dieses Projekt deaktiviert. Protokolleintrag muss manuell überprüft und  bestätigt werden."
          : ""
      const isSenderUnapprovedMessage =
        result.isSenderApproved === false
          ? "\nHinweis: Der Absender ist nicht für dieses Projekt genehmigt. Protokolleintrag muss manuell überprüft und  bestätigt werden."
          : ""
      alert(message + documentsMessage + aiDisabledMessage + isSenderUnapprovedMessage)
      navigate({ to: "/admin/project-records" })
    } catch (error) {
      console.error("Error:", error)
      alert("Fehler beim Verarbeiten der E-Mail")
    } finally {
      setProcessing(null)
    }
  }

  if (!projectRecordEmails.length) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-4">
        <ZeroCase visible name="Emails" />
        <Link to="/admin/project-record-emails/new" button className="mt-4">
          Erste E-Mail hinzufügen
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="mb-2">
          <strong>Hinweis:</strong> E-Mails ohne Protokolleinträge (gelb markiert) müssen noch
          prozessiert werden. <br />
          ‼️ E-Mails ohne zugeordnetes Projekt können nicht mit KI prozessiert werden und müssen
          zuerst bearbeitet werden.
        </p>
        <p>* Dokumente werden erst mit KI-Prozessierung erstellt und verknüpft.</p>
      </div>

      <div className={adminTableWrapperClassName}>
        <table className={adminTableClassName}>
          <thead className="bg-gray-50">
            <tr>
              <th className={adminTableHeaderClassName}>ID</th>
              <th className={adminTableHeaderClassName}>Email vom</th>
              <th className={adminTableHeaderClassName}>Erstellt am</th>
              <th className={adminTableHeaderClassName}>Projekt</th>
              <th className={adminTableHeaderClassName}>Von</th>
              <th className={adminTableHeaderClassName}>Betreff</th>
              <th className={adminTableHeaderClassName}>Protokolleinträge</th>
              <th className={adminTableHeaderClassName}>Dokumente*</th>
              <th className={adminTableHeaderRightClassName}>Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projectRecordEmails.map((email) => (
              <tr
                key={email.id}
                className={
                  email.projectRecords.length === 0
                    ? "bg-yellow-50 hover:bg-yellow-100"
                    : "hover:bg-gray-50"
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
                          className={clsx(
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
                    <Tooltip
                      content={
                        !email.projectId
                          ? "Kein Projekt zugeordnet – bitte zuerst Projekt zuweisen"
                          : undefined
                      }
                    >
                      <span className="inline-flex">
                        <AdminTablePrimaryButton
                          onClick={() => handleProcessEmail(email.id)}
                          disabled={processing === email.id || !email.projectId}
                          icon={<SparklesIcon aria-hidden />}
                        >
                          {processing === email.id ? "Prozessiere..." : "Prozessieren"}
                        </AdminTablePrimaryButton>
                      </span>
                    </Tooltip>
                    <AdminTableEditLink to={`/admin/project-record-emails/${email.id}/edit`} />
                  </AdminTableActions>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link to="/admin/project-record-emails/new" button className="mt-4">
        Neue E-Mail manuell hinzufügen
      </Link>
    </div>
  )
}
