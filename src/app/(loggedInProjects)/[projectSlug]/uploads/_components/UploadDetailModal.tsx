"use client"

import { DeleteUploadButton } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/DeleteUploadButton"
import { UploadPreview } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreview"
import { uploadUrl } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadUrl"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { SuperAdminBox } from "@/src/core/components/AdminBox/SuperAdminBox"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import { formatBerlinTime } from "@/src/core/utils/formatBerlinTime"
import { formatFileSize } from "@/src/core/utils/formatFileSize"
import { getFilenameFromS3 } from "@/src/server/uploads/_utils/url"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { useQuery } from "@blitzjs/rpc"
import { Route } from "next"

type Props = {
  uploadId: number | null
  projectSlug: string
  open: boolean
  onClose: () => void
  onDeleted?: () => void | Promise<void>
  editUrl?: Route
}

export const UploadDetailModal = ({
  uploadId,
  projectSlug,
  open,
  onClose,
  onDeleted,
  editUrl,
}: Props) => {
  const [upload] = useQuery(
    getUploadWithRelations,
    { projectSlug, id: uploadId! },
    { enabled: open && uploadId !== null },
  )

  // Check if upload was marked as deleted or is null
  if (!upload || (upload as any).__deleted) return null

  const hasSubsection = upload.subsection !== null
  const hasSubsubsection = upload.Subsubsection !== null
  const hasProjectRecords = upload.projectRecords && upload.projectRecords.length > 0
  const hasProjectRecordEmail = upload.projectRecordEmail !== null
  const hasRelations =
    hasSubsection || hasSubsubsection || hasProjectRecords || hasProjectRecordEmail

  return (
    <Modal open={open} handleClose={onClose} className="space-y-4 sm:max-w-2xl">
      <HeadingWithAction>
        <H3>{upload.title}</H3>
        <ModalCloseButton onClose={onClose} />
      </HeadingWithAction>

      {/* Preview */}
      <div className="flex gap-4">
        <UploadPreview
          uploadId={upload.id}
          projectSlug={projectSlug}
          size="grid"
          showTitle={false}
        />
        <div className="flex flex-col gap-1">
          <div>
            <h4 className="mb-1 text-sm font-medium text-gray-700">Dateiname</h4>
            <p className="text-sm text-gray-500">{getFilenameFromS3(upload.externalUrl)}</p>
          </div>

          {upload.fileSize && (
            <div>
              <h4 className="mb-1 block text-sm font-medium text-gray-700">Größe</h4>
              <p className="text-sm text-gray-500"> {formatFileSize(upload.fileSize)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm">
        <div className="border-t border-gray-200 pt-3">
          <p className="text-gray-600">
            Erstellt
            {upload.createdBy ? (
              <> von {getFullname(upload.createdBy)}</>
            ) : (
              " von Unbekannt"
            )} am {formatBerlinTime(upload.createdAt, "dd.MM.yyyy, HH:mm")}
          </p>
          {upload.updatedBy && (
            <p className="mt-1 text-gray-600">
              Aktualisiert
              {upload.updatedBy ? (
                <> von {getFullname(upload.updatedBy)}</>
              ) : (
                " von Unbekannt"
              )} am {formatBerlinTime(upload.updatedAt, "dd.MM.yyyy, HH:mm")}
            </p>
          )}
        </div>
        {upload.summary && (
          <div className="border-t border-gray-200 pt-3">
            <h4 className="mb-1 font-medium text-gray-700">Zusammenfassung</h4>
            <div className="max-h-60 space-y-3 overflow-y-auto text-gray-500">
              <Markdown className="prose-sm" markdown={upload.summary} />
            </div>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3">
          <h4 className="mb-1 text-sm font-medium text-gray-700">Verknüpfungen:</h4>
          {hasRelations ? (
            <div className="space-y-2 text-sm">
              {hasSubsection && (
                <div>
                  <span className="font-medium text-gray-900">Planungsabschnitt: </span>
                  <span className="text-gray-600">
                    {upload.subsection!.start}–{upload.subsection!.end}
                  </span>
                </div>
              )}
              {hasSubsubsection && (
                <div>
                  <span className="font-medium text-gray-900">Eintrag: </span>
                  <span className="text-gray-600">{upload.Subsubsection!.slug}</span>
                </div>
              )}
              {hasProjectRecords && (
                <div>
                  <span className="font-medium text-gray-900">Protokolleinträge: </span>
                  <div className="mt-1 space-y-1">
                    {upload.projectRecords!.map((record) => (
                      <Link
                        key={record.id}
                        href={projectRecordDetailRoute(projectSlug, record.id)}
                        className="block text-blue-600 hover:text-blue-800"
                      >
                        {record.title}
                        {record.date && (
                          <span className="ml-2 text-gray-500">
                            ({formatBerlinTime(record.date, "P")})
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {hasProjectRecordEmail && (
                <div>
                  <span className="font-medium text-gray-900">E-Mail-Anhang: </span>
                  <span className="text-gray-600">
                    {formatBerlinTime(upload.projectRecordEmail!.createdAt, "dd.MM.yyyy, HH:mm")}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Es wurden noch keine Verknüpfungen eingetragen.</p>
          )}
        </div>

        {upload.latitude && upload.longitude && (
          <div className="border-t border-gray-200 pt-3">
            <h4 className="mb-1 text-sm font-medium text-gray-700">Standort:</h4>
            <p className="text-sm text-gray-500">
              {upload.latitude}, {upload.longitude}
            </p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3">
          {upload.collaborationUrl ? (
            <div className="space-y-2">
              <Link blank button="blue" icon="collaboration" href={upload.collaborationUrl}>
                Dokument gemeinsam bearbeiten
              </Link>
              <SuperAdminBox>
                <Link blank href={uploadUrl(upload, projectSlug)}>
                  Original-Datei (S3)
                </Link>
              </SuperAdminBox>
            </div>
          ) : (
            <Link
              blank
              href={uploadUrl(upload, projectSlug)}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              Datei öffnen
            </Link>
          )}
        </div>
      </div>

      {/* Actions */}
      {(editUrl || onDeleted) && (
        <IfUserCanEdit>
          <ButtonWrapper className="border-t border-gray-200 pt-4">
            {editUrl && (
              <Link button="blue" href={editUrl}>
                Bearbeiten
              </Link>
            )}
            {onDeleted && (
              <DeleteUploadButton
                projectSlug={projectSlug}
                uploadId={upload.id}
                uploadTitle={upload.title}
                onDeleted={async () => {
                  await onDeleted()
                  onClose()
                }}
                className="text-sm"
              />
            )}
          </ButtonWrapper>
        </IfUserCanEdit>
      )}
    </Modal>
  )
}
