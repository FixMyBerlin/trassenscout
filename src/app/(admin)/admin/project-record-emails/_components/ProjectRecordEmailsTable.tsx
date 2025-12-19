"use client"

import { processProjectRecordEmail } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_actions/processProjectRecordEmail"
import { Link } from "@/src/core/components/links"
import { shortTitle } from "@/src/core/components/text"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { ProjectRecordEmailWithRelations } from "@/src/server/ProjectRecordEmails/queries/getProjectRecordEmails"
import { SparklesIcon } from "@heroicons/react/16/solid"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  projectRecordEmails: ProjectRecordEmailWithRelations[]
}

export const ProjectRecordEmailsTable = ({ projectRecordEmails }: Props) => {
  const [processing, setProcessing] = useState<number | null>(null)
  const router = useRouter()

  const handleProcessEmail = async (projectRecordEmailId: number) => {
    setProcessing(projectRecordEmailId)
    try {
      const result = await processProjectRecordEmail({ projectRecordEmailId })

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
      router.push("/admin/project-records")
    } catch (error) {
      console.error("Error:", error)
      alert("Fehler beim Verarbeiten der E-Mail")
    } finally {
      setProcessing(null)
    }
  }

  if (!projectRecordEmails.length) {
    return (
      <div className="rounded-md bg-gray-50 p-4">
        <ZeroCase visible name="Emails" />
        <Link
          href="/admin/project-record-emails/new"
          className="mt-2 inline-block text-blue-600 hover:text-blue-800"
        >
          Erste E-Mail hinzufügen
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 rounded-md bg-blue-50 p-4 text-blue-800">
        <p className="mb-2">
          <strong>Hinweis:</strong> E-Mails ohne Protokolleinträge (gelb markiert) müssen noch
          prozessiert werden. <br />
          ‼️ E-Mails ohne zugeordnetes Projekt können nicht mit KI prozessiert werden und müssen
          zunächst bearbeitet werden.
        </p>
        <p>* Dokumente werden erst mit KI-Prozessierung erstellt und verknüpft.</p>
      </div>

      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
              Email vom
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
              Erstellt am
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
              Projekt
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
              Von
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
              Betreff
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
              Protokolleinträge
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
              Dokumente*
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Aktionen</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {projectRecordEmails.map((email) => (
            <tr
              key={email.id}
              className={
                email.projectRecords.length === 0
                  ? "bg-yellow-50 hover:bg-yellow-100"
                  : "hover:bg-gray-50"
              }
            >
              <td className="px-6 py-4 text-sm text-gray-900">
                <Link
                  href={`/admin/project-record-emails/${email.id}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {email.id}
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {email.date
                  ? format(new Date(email.date), "dd. MMMM yyyy, HH:mm", { locale: de })
                  : "—"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {email.createdAt
                  ? format(new Date(email.createdAt), "dd. MMMM yyyy, HH:mm", { locale: de })
                  : "—"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {email.project ? (
                  <Link href={`/${email.project.slug}/project-records`}>
                    {shortTitle(email.project.slug)}
                  </Link>
                ) : (
                  "‼️ Kein Projekt zugeordnet"
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{email.from || "—"}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{email.subject || "—"}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {email.projectRecords.length > 0 ? (
                  <ul className="space-y-1">
                    {email.projectRecords.map((projectRecord: any) => (
                      <li key={projectRecord.id}>
                        <Link href={`/admin/project-records/${projectRecord.id}/edit`}>
                          {projectRecord.id}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {email.uploads.length > 0
                  ? email.uploads.map((upload) => <p key={upload.id}>{upload.id}</p>)
                  : "—"}
              </td>
              <td className="flex flex-col items-start gap-2 px-6 py-4 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => handleProcessEmail(email.id)}
                  disabled={processing === email.id || !email.projectId}
                  title={
                    !email.projectId
                      ? "Kein Projekt zugeordnet - bitte zuerst Projekt zuweisen"
                      : undefined
                  }
                  className="flex items-center gap-1 rounded-sm bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SparklesIcon className="h-3 w-3" />
                  {processing === email.id ? "Verarbeite..." : "Mit KI prozessieren"}
                </button>
                <Link
                  href={`/admin/project-record-emails/${email.id}/edit`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Bearbeiten
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link href="/admin/project-record-emails/new" button>
        Neue E-Mail manuell hinzufügen
      </Link>
    </div>
  )
}
