"use client"

import { SuperAdminBox } from "@/src/core/components/AdminBox/SuperAdminBox"
import { Link, linkIcons } from "@/src/core/components/links"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import getSupportDocuments from "@/src/server/supportDocuments/queries/getSupportDocuments"
import { getFilenameFromS3 } from "@/src/server/uploads/_utils/url"
import { useQuery } from "@blitzjs/rpc"

import { BookOpenIcon } from "@heroicons/react/24/outline"
import { SupportUploadDropzone } from "./SupportUploadDropzone"

export const SupportPageClient = () => {
  const [documents, { refetch }] = useQuery(getSupportDocuments, undefined, {
    refetchOnWindowFocus: false,
  })

  const handleUploadComplete = async () => {
    await refetch()
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
                  className="flex flex-col items-center gap-2.5 rounded-lg border border-gray-200 p-8"
                >
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
                      href={`/admin/support-documents/${doc.id}/edit`}
                    >
                      {linkIcons["edit"]} Bearbeiten
                    </Link>
                  </SuperAdminBox>
                </li>
              )
            })}
        </ul>
      ) : (
        <ZeroCase visible={documents.length} name="Dokumente" />
      )}

      <SuperAdminBox>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Dokumente verwalten</h2>
          <SupportUploadDropzone onUploadComplete={handleUploadComplete} />
        </div>
      </SuperAdminBox>
    </div>
  )
}
