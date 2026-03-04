"use client"

import { SuperAdminBox } from "@/src/core/components/AdminBox/SuperAdminBox"
import { Link, linkIcons, linkStyles } from "@/src/core/components/links"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import getSupportDocuments from "@/src/server/supportDocuments/queries/getSupportDocuments"
import { getFilenameFromS3 } from "@/src/server/uploads/_utils/url"
import { useQuery } from "@blitzjs/rpc"
import { twMerge } from "tailwind-merge"
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
        <div className="space-y-4">
          {documents
            .filter((doc) => doc.upload)
            .map((doc) => {
              const filename = getFilenameFromS3(doc.upload!.externalUrl)
              const downloadUrl = `/api/support/documents/${doc.id}/${filename}`

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={downloadUrl} blank>
                        {doc.title}
                      </Link>
                      <SuperAdminBox>
                        <Link
                          href={`/admin/support-documents/${doc.id}/edit`}
                          className={twMerge(
                            linkStyles,
                            "flex cursor-pointer items-center justify-center gap-1",
                          )}
                        >
                          {linkIcons["edit"]} Bearbeiten
                        </Link>
                      </SuperAdminBox>
                    </div>
                    {doc.description && (
                      <p className="mt-1 text-sm text-gray-600">{doc.description}</p>
                    )}
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
                    </SuperAdminBox>
                  </div>
                  <div className="ml-4 flex gap-2"></div>
                </div>
              )
            })}
        </div>
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
