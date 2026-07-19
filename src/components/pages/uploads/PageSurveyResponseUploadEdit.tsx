import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { EditUploadForm } from "@/src/components/uploads/EditUploadForm"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/surveys/$surveyId/responses/$surveyResponseId/uploads/$uploadId/edit/",
)

export function PageSurveyResponseUploadEdit() {
  const { projectSlug, surveyId, surveyResponseId, uploadId } = routeApi.useParams()
  const { data: upload } = useSuspenseQuery(
    uploadQueryOptions({ projectSlug, id: Number(uploadId) }),
  )

  const returnPath = `/${projectSlug}/surveys/${surveyId}/responses?responseDetails=${surveyResponseId}`

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Dokumente"
            sectionTo="/$projectSlug/uploads"
            current="bearbeiten"
          />
        }
      />
      <EditUploadForm
        upload={upload}
        returnPath={returnPath}
        returnText="Zurück zu den Eingaben"
        showDelete={false}
      />
    </>
  )
}
