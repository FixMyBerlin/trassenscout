import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { UploadsPageUploadSection } from "@/src/components/uploads/uploads-page/UploadsPageUploadSection"
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
  const { data: uploads } = useSuspenseQuery(uploadsQueryOptions({ projectSlug }))
  const visibleUploads = uploads.filter((upload) => !isSurveyOnlyUpload(upload))

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className={pageContentPaddingClassName}>
          <UploadsPageUploadSection projectSlug={projectSlug} />
        </div>

        <UploadTable projectSlug={projectSlug} withAction withRelations uploads={visibleUploads} />
      </div>

      <SuperAdminBox>
        <strong>Hinweis:</strong> Uploads, die ausschließlich mit Eingaben verknüpft sind, werden in
        dieser Übersicht nicht angezeigt. Diese Uploads sind nur über den jeweiligen Eingabe
        zugänglich.
      </SuperAdminBox>
    </>
  )
}
