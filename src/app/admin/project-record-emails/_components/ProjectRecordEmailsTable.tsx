"use client"

import { Link } from "@/src/core/components/links"
import { ProjectRecordEmailWithRelations } from "@/src/server/ProjectRecordEmails/queries/getProjectRecordEmails"
import { SparklesIcon } from "@heroicons/react/16/solid"
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
      const response = await fetch("/api/process-project-record-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // This does not make a lot of sense in a client request, but needed for system calls in the future
          // "process-email-api-key": process.env.INTERNAL_API_SECRET,
        },
        body: JSON.stringify({ projectRecordEmailId }),
      })

      if (response.ok) {
        const result = (await response.json()) as { projectRecordId: number; uploadIds?: number[] }
        const message = `Protokoll erfolgreich erstellt! ID: ${result.projectRecordId}`
        const documentsMessage = result.uploadIds?.length
          ? `\nDokumente mit den IDs: ${result.uploadIds.join(", ")} erstellt und verknüpft.`
          : ""
        alert(message + documentsMessage)
        router.push("/admin/project-records")
      } else {
        alert("Fehler beim Verarbeiten der E-Mail")
      }
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
        <p className="text-gray-500">Noch keine E-Mails vorhanden.</p>
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
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Projekt
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Inhalt (Vorschau)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Erstellt am
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Protokolle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Dokumente
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Aktionen</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {projectRecordEmails.map((email) => (
            <tr key={email.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">
                <Link
                  href={`/admin/project-record-emails/${email.id}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  #{email.id}
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">Projekt #{email.projectId}</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {email.text.slice(0, 50)}
                {email.text.length > 50 ? "..." : ""}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(email.createdAt).toLocaleDateString("de-DE")}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {email.projectRecords.length > 0 ? (
                  <ul className="space-y-1">
                    {email.projectRecords.map((projectRecord: any) => (
                      <li key={projectRecord.id}>
                        <Link href={`/admin/project-records/${projectRecord.id}/review`}>
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
                {email.uploads.length > 0 ? (
                  <ul className="space-y-1">
                    {email.uploads.map((upload: any) => (
                      <li key={upload.id}>
                        <a
                          href={upload.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          title={upload.title}
                        >
                          {upload.title.length > 30
                            ? `${upload.title.slice(0, 30)}...`
                            : upload.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )}
              </td>
              <td className="flex flex-col items-start gap-2 px-6 py-4 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => handleProcessEmail(email.id)}
                  disabled={processing === email.id}
                  className="flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
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

      <Link
        href="/admin/project-record-emails/new"
        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Neue E-Mail hinzufügen
      </Link>
    </div>
  )
}
