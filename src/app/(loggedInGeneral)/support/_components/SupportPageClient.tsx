"use client"

import { SuperAdminBox } from "@/src/core/components/AdminBox/SuperAdminBox"
import {
  blueButtonStyles,
  Link,
  linkIcons,
  linkStyles,
  whiteButtonStyles,
} from "@/src/core/components/links"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import deleteSupportDocument from "@/src/server/supportDocuments/mutations/deleteSupportDocument"
import updateSupportDocument from "@/src/server/supportDocuments/mutations/updateSupportDocument"
import getSupportDocuments from "@/src/server/supportDocuments/queries/getSupportDocuments"
import { getFilenameFromS3 } from "@/src/server/uploads/_utils/url"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { SupportUploadDropzone } from "./SupportUploadDropzone"

export const SupportPageClient = () => {
  const [documents, { refetch }] = useQuery(getSupportDocuments, undefined, {
    refetchOnWindowFocus: false,
  })
  const [deleteSupportDocumentMutation] = useMutation(deleteSupportDocument)
  const [updateSupportDocumentMutation] = useMutation(updateSupportDocument)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>("")

  const handleDelete = async (id: number) => {
    if (!confirm("Möchten Sie dieses Dokument wirklich löschen?")) {
      return
    }
    try {
      await deleteSupportDocumentMutation({ id })
      await refetch()
    } catch (error) {
      console.error("Error deleting document:", error)
      alert("Fehler beim Löschen des Dokuments.")
    }
  }

  const handleStartEdit = (doc: { id: number; title: string }) => {
    setEditingId(doc.id)
    setEditingTitle(doc.title)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const handleSaveTitle = async (id: number) => {
    if (!editingTitle.trim()) {
      alert("Der Titel darf nicht leer sein.")
      return
    }
    try {
      await updateSupportDocumentMutation({ id, title: editingTitle.trim() })
      setEditingId(null)
      setEditingTitle("")
      await refetch()
    } catch (error) {
      console.error("Error updating document title:", error)
      alert("Fehler beim Aktualisieren des Titels.")
    }
  }

  const handleUploadComplete = async () => {
    await refetch()
  }

  return (
    <div className="space-y-6">
      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="space-y-4">
          {documents.map((doc) => {
            const filename = getFilenameFromS3(doc.externalUrl)
            const downloadUrl = `/api/support/documents/${doc.id}/${filename}`

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex-1">
                  {editingId === doc.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveTitle(doc.id)
                          } else if (e.key === "Escape") {
                            handleCancelEdit()
                          }
                        }}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => handleSaveTitle(doc.id)} className={blueButtonStyles}>
                        Speichern
                      </button>
                      <button onClick={handleCancelEdit} className={whiteButtonStyles}>
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link href={downloadUrl} blank>
                        {doc.title}
                      </Link>
                      <SuperAdminBox>
                        <button
                          onClick={() => handleStartEdit(doc)}
                          className={twMerge(
                            linkStyles,
                            "flex cursor-pointer items-center justify-center gap-1",
                          )}
                          title="Titel bearbeiten"
                        >
                          {linkIcons["edit"]} Bearbeiten
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id)}
                          className={clsx(
                            linkStyles,
                            "inline-flex items-center justify-center gap-1",
                          )}
                        >
                          {linkIcons["delete"]}
                          Löschen
                        </button>
                      </SuperAdminBox>
                    </div>
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

      {/* Admin Upload Section */}
      <SuperAdminBox>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Dokumente verwalten</h2>
          <SupportUploadDropzone onUploadComplete={handleUploadComplete} />
        </div>
      </SuperAdminBox>
    </div>
  )
}
