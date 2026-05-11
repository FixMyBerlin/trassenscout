"use client"

import { DeleteUploadButton } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/DeleteUploadButton"
import { LuckyCloudDocumentLink } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/LuckyCloudDocumentLink"
import { UploadAuthorAndDates } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadAuthorAndDates"
import { UploadPreview } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreview"
import { UploadVerknuepfungen } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadVerknuepfungen"
import { uploadUrl } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadUrl"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { Link, blueButtonStylesForLinkElement } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { appendReturnToToUploadEditRoute } from "@/src/core/routes/uploadRoutes"
import { useCurrentReturnTo } from "@/src/core/routes/useCurrentPathWithSearch"
import { formatFileSize } from "@/src/core/utils/formatFileSize"
import { getFilenameFromS3 } from "@/src/server/uploads/_utils/url"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { clsx } from "clsx"
import { Route } from "next"

type Props = {
  upload: Awaited<ReturnType<typeof getUploadWithRelations>>
  projectSlug: string
  onDeleted?: () => void | Promise<void>
  editUrl?: Route
  onEditClick?: () => void
}

export const UploadDetailPanelContent = ({
  upload,
  projectSlug,
  onDeleted,
  editUrl,
  onEditClick,
}: Props) => {
  const returnTo = useCurrentReturnTo()
  const editHref = editUrl ? appendReturnToToUploadEditRoute(editUrl, returnTo) : undefined

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <UploadPreview upload={upload} projectSlug={projectSlug} size="grid" showTitle={false} />
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
            <Link
              blank
              href={uploadUrl(upload, projectSlug)}
              className={clsx(
                blueButtonStylesForLinkElement,
                "inline-flex items-center gap-2 whitespace-nowrap",
              )}
            >
              Datei öffnen
            </Link>
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
          <UploadVerknuepfungen
            projectSlug={projectSlug}
            landAcquisitionModuleEnabled={upload.project?.landAcquisitionModuleEnabled ?? false}
            subsection={upload.subsection}
            subsubsections={upload.subsubsections}
            acquisitionArea={upload.acquisitionArea}
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

      {(editUrl || onDeleted) && (
        <IfUserCanEdit>
          <ButtonWrapper className="border-t border-gray-200 pt-4">
            {editHref && (
              <Link
                button="blue"
                href={editHref}
                prefetch={false}
                replace
                scroll={false}
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
