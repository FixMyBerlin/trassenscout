import { BookOpenIcon } from "@heroicons/react/24/outline"
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { Link, linkIcons } from "@/src/components/core/components/links/Link"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { SupportUploadDropzone } from "@/src/components/pages/support/SupportUploadDropzone"
import { supportDocumentsQueryOptions } from "@/src/server/supportDocuments/supportDocumentsQueryOptions"
import { getFilenameFromS3 } from "@/src/shared/uploads/url"

export const SupportPageClient = () => {
  const queryClient = useQueryClient()
  const { data: documents } = useSuspenseQuery(supportDocumentsQueryOptions())

  const handleUploadComplete = async () => {
    await queryClient.invalidateQueries({ queryKey: supportDocumentsQueryOptions().queryKey })
  }

  return (
    <div className="space-y-6">
      {documents.length > 0 ? (
        <ul className="space-y-4">
          {documents
            .filter((doc) => doc.upload)
            .map((doc) => {
              const filename = getFilenameFromS3(doc.upload!.externalUrl)
              const downloadUrl = `/api/support/documents/${doc.id}/${filename}`

              return (
                <li
                  key={doc.id}
                  className="flex justify-center rounded-lg border border-gray-200 p-8"
                >
                  <div className="flex max-w-2xl flex-col items-center gap-2.5">
                    <BookOpenIcon className="size-8" />
                    <p className="font-semibold">{doc.title}</p>
                    {doc.description && (
                      <p className="mt-1 text-center text-sm text-gray-600">{doc.description}</p>
                    )}
                    <Link href={downloadUrl} blank>
                      Öffnen
                    </Link>

                    <SuperAdminBox>
                      <div className="mt-1 flex gap-4 text-sm text-gray-500">
                        <span>
                          Hochgeladen: {new Date(doc.createdAt).toLocaleDateString("de-DE")}
                        </span>
                        {doc.createdBy && (
                          <span>
                            von {doc.createdBy.firstName} {doc.createdBy.lastName}
                          </span>
                        )}
                        <span>Reihenfolge: {doc.order}</span>
                      </div>
                      <Link
                        className="mt-2 flex items-center gap-2"
                        to={`/admin/support-documents/${doc.id}/edit`}
                        icon={linkIcons.edit}
                      >
                        Bearbeiten
                      </Link>
                    </SuperAdminBox>
                  </div>
                </li>
              )
            })}
        </ul>
      ) : (
        <ZeroCase visible text="Noch keine Dokumente vorhanden." />
      )}

      <SuperAdminBox>
        <SupportUploadDropzone onUploadComplete={handleUploadComplete} />
      </SuperAdminBox>
    </div>
  )
}
