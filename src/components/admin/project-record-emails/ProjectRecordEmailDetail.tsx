import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { adminTableEditButtonClassName } from "@/src/components/admin/adminListClasses"
import { UploadPreviewClickable } from "@/src/components/uploads/UploadPreviewClickable"
import { projectRecordEmailQueryOptions } from "@/src/server/projectRecordEmails/queries/projectRecordEmailsQueryOptions"

type Props = {
  projectRecordEmailId: number
}

export const ProjectRecordEmailDetail = ({ projectRecordEmailId }: Props) => {
  const { data: projectRecordEmail } = useSuspenseQuery(
    projectRecordEmailQueryOptions(projectRecordEmailId),
  )

  return (
    <>
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
              <dt className="text-sm font-medium text-gray-500">Anhänge</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div className="flex gap-3">
                  {projectRecordEmail.uploads.map((upload) =>
                    projectRecordEmail.project ? (
                      <UploadPreviewClickable
                        key={upload.id}
                        uploadId={upload.id}
                        projectSlug={projectRecordEmail.project.slug}
                        size="grid"
                      />
                    ) : (
                      <p key={upload.id}>{upload.id}</p>
                    ),
                  )}
                </div>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
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

      <div className="mt-8 flex justify-end">
        <Link
          to="/admin/project-record-emails/$projectRecordEmailId/edit"
          params={{ projectRecordEmailId: String(projectRecordEmailId) }}
          className={adminTableEditButtonClassName}
        >
          Bearbeiten
        </Link>
      </div>
    </>
  )
}
