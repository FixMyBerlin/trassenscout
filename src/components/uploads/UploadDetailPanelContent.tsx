import type { MouseEventHandler } from "react"
import { twJoin } from "tailwind-merge"
import { primaryButtonLinkClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link } from "@/src/components/core/components/links/Link"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { useCurrentReturnTo } from "@/src/components/core/routes/useCurrentPathWithSearch"
import { formatFileSize } from "@/src/components/core/utils/formatFileSize"
import { IfUserCanEdit } from "@/src/components/shared/memberships/IfUserCan"
import { DeleteUploadButton } from "@/src/components/uploads/DeleteUploadButton"
import { LuckyCloudDocumentLink } from "@/src/components/uploads/LuckyCloudDocumentLink"
import { UploadAuthorAndDates } from "@/src/components/uploads/UploadAuthorAndDates"
import { UploadPdfViewer } from "@/src/components/uploads/UploadPdfViewer"
import { UploadPreview } from "@/src/components/uploads/UploadPreview"
import { UploadVerknuepfungen } from "@/src/components/uploads/UploadVerknuepfungen"
import { isPdf } from "@/src/components/uploads/utils/getFileType"
import { uploadUrl } from "@/src/components/uploads/utils/uploadUrl"
import { getFilenameFromS3 } from "@/src/shared/uploads/url"
import type { UploadEditLink, UploadWithRelations } from "./uploadTypes"

type Props = {
  upload: UploadWithRelations
  projectSlug: string
  onDeleted?: () => void | Promise<void>
  editLink?: UploadEditLink
  editHref?: string
  onEditClick?: MouseEventHandler<HTMLAnchorElement>
}

export const UploadDetailPanelContent = ({
  upload,
  projectSlug,
  onDeleted,
  editLink,
  editHref,
  onEditClick,
}: Props) => {
  const returnTo = useCurrentReturnTo()
  const editSearch =
    editLink && returnTo && !editLink.search?.returnTo
      ? { ...editLink.search, returnTo }
      : editLink?.search
  const isUploadPdf = isPdf(upload)

  return (
    <div className="space-y-6">
      <div className={twJoin("flex gap-6", isUploadPdf ? "flex-col gap-4" : "")}>
        {isUploadPdf ? (
          <div className="max-w-[250px]">
            <UploadPdfViewer fileUrl={uploadUrl(upload, projectSlug)} />
          </div>
        ) : (
          <UploadPreview upload={upload} projectSlug={projectSlug} size="grid" showTitle={false} />
        )}
        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Dateiname {upload.fileSize && "(Größe)"}
            </h4>
            <p className="text-sm text-gray-500">
              {getFilenameFromS3(upload.externalUrl)}
              {upload.fileSize && ` (${formatFileSize(upload.fileSize)})`}
            </p>
          </div>

          {upload.collaborationUrl ? (
            <LuckyCloudDocumentLink collaborationUrl={upload.collaborationUrl} />
          ) : (
            <div className="flex flex-wrap gap-2">
              {isUploadPdf && (
                <Link
                  to="/$projectSlug/uploads/$uploadId/view"
                  params={{ projectSlug, uploadId: String(upload.id) }}
                  className={primaryButtonLinkClassName}
                >
                  In Vollansicht öffnen
                </Link>
              )}
              <Link
                blank
                href={uploadUrl(upload, projectSlug)}
                className={primaryButtonLinkClassName}
              >
                Datei {isUploadPdf && "m Browser "}öffnen
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <UploadAuthorAndDates
          createdBy={upload.createdBy}
          createdAt={upload.createdAt}
          updatedBy={upload.updatedBy ?? undefined}
          updatedAt={upload.updatedAt ?? undefined}
        />

        {upload.summary && (
          <div className="border-t border-gray-200 pt-3">
            <h4 className="font-medium text-gray-700">Zusammenfassung</h4>
            <div className="max-h-60 space-y-3 overflow-y-auto text-gray-500">
              <Markdown className="prose-sm" markdown={upload.summary} />
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3">
          <h4 className="text-sm font-medium">Verknüpfungen:</h4>
          <UploadVerknuepfungen
            projectSlug={projectSlug}
            landAcquisitionModuleEnabled={upload.project?.landAcquisitionModuleEnabled ?? false}
            subsubsections={upload.subsubsections}
            acquisitionAreas={upload.acquisitionAreas}
            projectRecords={upload.projectRecords}
            projectRecordEmail={upload.projectRecordEmail}
            surveyResponse={upload.surveyResponse}
          />
        </div>

        {upload.latitude && upload.longitude && (
          <div className="border-t border-gray-200 pt-3">
            <h4 className="text-sm font-medium text-gray-700">Standort:</h4>
            <p className="text-sm text-gray-500">
              {upload.latitude}, {upload.longitude}
            </p>
          </div>
        )}
      </div>

      {(editLink || onDeleted) && (
        <IfUserCanEdit>
          <ButtonWrapper className="border-t border-gray-200 pt-4">
            {editLink && (
              <Link
                button="blue"
                to={editHref ?? editLink.to}
                params={editHref ? undefined : editLink.params}
                search={editHref ? undefined : editSearch}
                preload={false}
                replace
                resetScroll={false}
                onClick={onEditClick}
              >
                Bearbeiten
              </Link>
            )}
            {onDeleted && (
              <DeleteUploadButton
                projectSlug={projectSlug}
                uploadId={upload.id}
                uploadTitle={upload.title}
                onDeleted={onDeleted}
                className="text-sm"
              />
            )}
          </ButtonWrapper>
        </IfUserCanEdit>
      )}
    </div>
  )
}
