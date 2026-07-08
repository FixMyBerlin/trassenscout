import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useState } from "react"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { UploadDropzone } from "@/src/components/uploads/UploadDropzone"
import { UploadProtocolReport } from "@/src/components/uploads/UploadProtocolReport"
import { UploadTable } from "@/src/components/uploads/UploadTable"
import { useUploadProtocol } from "@/src/components/uploads/useUploadProtocol"
import { uploadsQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"
import type { UploadWithRelations } from "./uploadTypes"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

function isSurveyOnlyUpload(upload: UploadWithRelations) {
  return (
    upload.surveyResponseId !== null &&
    upload.projectRecordEmailId === null &&
    upload.projectRecords.length === 0 &&
    upload.subsubsections.length === 0 &&
    upload.acquisitionAreas.length === 0
  )
}

export const UploadsPageContent = () => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const queryClient = useQueryClient()
  const { data: uploads } = useSuspenseQuery(uploadsQueryOptions({ projectSlug }))
  const visibleUploads = uploads.filter((upload) => !isSurveyOnlyUpload(upload))

  const [assignBySlug, setAssignBySlug] = useState(false)
  const protocol = useUploadProtocol({ projectSlug })

  return (
    <>
      {/* flex gap instead of space-y: TableWrapper's -my-2 overrides space-y margins (zero-specificity :where() in Tailwind v4) */}
      <div className="mt-8 flex flex-col gap-8">
        <UploadTable projectSlug={projectSlug} withAction withRelations uploads={visibleUploads} />

        {protocol.hasProtocol && (
          <UploadProtocolReport
            entries={protocol.entries}
            finished={protocol.finished}
            onDismiss={protocol.reset}
          />
        )}

        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={assignBySlug}
              onChange={(event) => setAssignBySlug(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-gray-300 accent-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            />
            <span>
              Maßnahmen automatisch aus Dateinamen zuordnen
              <span className="block text-xs text-gray-500">
                Erwartetes Format: <code>&lt;abschnitt&gt;_&lt;massnahme&gt;_dateiname</code>, z. B.{" "}
                <code>line-3_point-1_foto.jpg</code>
              </span>
            </span>
          </label>

          <UploadDropzone
            projectSlug={projectSlug}
            assignSubsubsectionFromFilename={assignBySlug}
            onBatchStart={(files) => protocol.startBatch(files, { assignBySlug })}
            onFileRecordResult={protocol.recordResult}
            onUploadFail={protocol.recordUploadFails}
            onUploadComplete={async () => {
              await queryClient.invalidateQueries({
                queryKey: uploadsQueryOptions({ projectSlug }).queryKey,
              })
            }}
          />
        </div>
      </div>

      <SuperAdminBox>
        <strong>Hinweis:</strong> Uploads, die ausschließlich mit Eingaben verknüpft sind, werden in
        dieser Übersicht nicht angezeigt. Diese Uploads sind nur über den jeweiligen Eingabe
        zugänglich.
      </SuperAdminBox>
    </>
  )
}
