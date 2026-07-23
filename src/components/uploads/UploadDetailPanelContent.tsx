import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { formatFileSize } from "@/src/components/core/utils/formatFileSize"
import { LuckyCloudDocumentLink } from "@/src/components/uploads/LuckyCloudDocumentLink"
import { UploadPdfViewer } from "@/src/components/uploads/UploadPdfViewer"
import { UploadPreview } from "@/src/components/uploads/UploadPreview"
import { UploadProjectRecordLinks } from "@/src/components/uploads/UploadProjectRecordLinks"
import { UploadVerknuepfungen } from "@/src/components/uploads/UploadVerknuepfungen"
import { isPdf } from "@/src/components/uploads/utils/getFileType"
import { uploadUrl } from "@/src/components/uploads/utils/uploadUrl"
import { getFilenameFromS3 } from "@/src/shared/uploads/url"
import type { UploadWithRelations } from "./uploadTypes"

type Props = {
  upload: UploadWithRelations
  projectSlug: string
}

export const UploadDetailPanelContent = ({ upload, projectSlug }: Props) => {
  const isUploadPdf = isPdf(upload)
  const linkedProjectRecords = upload.projectRecords ?? []

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
                  button
                  to="/$projectSlug/uploads/$uploadId/view"
                  params={{ projectSlug, uploadId: String(upload.id) }}
                >
                  In Vollansicht öffnen
                </Link>
              )}
              <Link blank button href={uploadUrl(upload, projectSlug)}>
                Datei {isUploadPdf && "im Browser "}öffnen
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <UploadProjectRecordLinks
          projectSlug={projectSlug}
          projectRecords={linkedProjectRecords}
          className="border-t border-gray-200 pt-3"
        />

        {upload.summary && (
          <div className="border-t border-gray-200 pt-3">
            <h4 className="font-medium text-gray-700">Zusammenfassung</h4>
            <div className="max-h-60 space-y-3 overflow-y-auto text-gray-500">
              <Markdown className="prose-sm" markdown={upload.summary} />
            </div>
          </div>
        )}

        <UploadVerknuepfungen
          projectSlug={projectSlug}
          landAcquisitionModuleEnabled={upload.project?.landAcquisitionModuleEnabled ?? false}
          subsubsections={upload.subsubsections}
          acquisitionAreas={upload.acquisitionAreas}
          projectRecords={null}
          projectRecordEmail={upload.projectRecordEmail}
          surveyResponse={upload.surveyResponse}
          tags={upload.tags ?? []}
          variant="aligned"
          className="border-t border-gray-200 pt-3"
        />

        {upload.latitude && upload.longitude && (
          <div className="border-t border-gray-200 pt-3">
            <h4 className="text-sm font-medium text-gray-700">Standort:</h4>
            <p className="text-sm text-gray-500">
              {upload.latitude}, {upload.longitude}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
