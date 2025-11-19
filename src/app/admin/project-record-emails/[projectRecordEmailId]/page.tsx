import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjectRecordEmail from "@/src/server/ProjectRecordEmails/queries/getProjectRecordEmail"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Protokoll-E-Mail",
}

export default async function ProjectRecordEmailDetailPage({
  params,
}: {
  params: { projectRecordEmailId: string }
}) {
  const projectRecordEmailId = parseInt(params.projectRecordEmailId)
  const projectRecordEmail = await invoke(getProjectRecordEmail, {
    id: projectRecordEmailId,
  })

  return (
    <>
      <PageHeader title={`Protokoll-E-Mail #${projectRecordEmail.id}`} className="mt-12" />

      <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Von</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {projectRecordEmail.from || "—"}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Betreff</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {projectRecordEmail.subject || "—"}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">E-Mail-Datum</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {projectRecordEmail.date
                  ? new Date(projectRecordEmail.date).toLocaleString("de-DE")
                  : "—"}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Erstellt am</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {new Date(projectRecordEmail.createdAt).toLocaleDateString("de-DE")}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Projekt-ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {projectRecordEmail.projectId}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Verknüpfte Protokolle</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {projectRecordEmail.projectRecords.length > 0 ? (
                  <div className="space-y-2">
                    {projectRecordEmail.projectRecords.map((projectRecord: any) => (
                      <div key={projectRecord.id}>
                        <span className="text-blue-600">{projectRecord.title}</span>
                        {projectRecord.author && (
                          <span className="ml-2 text-gray-500">
                            von {projectRecord.author.firstName} {projectRecord.author.lastName}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  "Keine verknüpften Protokolle"
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">E-Mail-Text</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap">
                    {projectRecordEmail.textBody || projectRecordEmail.text}
                  </pre>
                </div>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Roher E-Mail-Inhalt</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <details>
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Rohdaten anzeigen
                  </summary>
                  <div className="prose mt-2 max-w-none">
                    <pre className="text-xs whitespace-pre-wrap">{projectRecordEmail.text}</pre>
                  </div>
                </details>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Link href="/admin/project-record-emails">← Zurück zur E-Mail-Übersicht</Link>
        <Link
          href={`/admin/project-record-emails/${projectRecordEmailId}/edit`}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Bearbeiten
        </Link>
      </div>
    </>
  )
}
