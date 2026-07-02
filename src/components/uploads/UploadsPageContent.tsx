import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { UploadDropzone } from "@/src/components/uploads/UploadDropzone"
import { UploadTable } from "@/src/components/uploads/UploadTable"
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

  return (
    <>
      <div className="mt-8 space-y-8">
        <UploadTable withAction withRelations uploads={visibleUploads} />
        <UploadDropzone
          onUploadComplete={async () => {
            await queryClient.invalidateQueries({
              queryKey: uploadsQueryOptions({ projectSlug }).queryKey,
            })
          }}
        />
      </div>

      <SuperAdminBox>
        <strong>Hinweis:</strong> Uploads, die ausschließlich mit Eingaben verknüpft sind, werden in
        dieser Übersicht nicht angezeigt. Diese Uploads sind nur über den jeweiligen Eingabe
        zugänglich.
      </SuperAdminBox>
    </>
  )
}
