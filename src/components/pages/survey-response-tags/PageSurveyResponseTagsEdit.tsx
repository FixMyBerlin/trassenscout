import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useRouter } from "@tanstack/react-router"
import { FormModal } from "@/src/components/core/components/Modal/FormModal"
import { SurveyResponseTagsOverview } from "@/src/components/pages/survey-response-tags/PageSurveyResponseTags"
import { EditSurveyResponseTagForm } from "@/src/components/survey-response-tags/EditSurveyResponseTagForm"
import { useSurveyResponseTagRouteLinks } from "@/src/components/survey-response-tags/useSurveyResponseTagActions"
import { surveyResponseTagsWithUsageCountQueryOptions } from "@/src/server/surveyResponseTags/surveyResponseTagsQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/survey-response-tags/$tagId/edit/")

export function PageSurveyResponseTagsEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const tagId = Number(params.tagId)
  const router = useRouter()
  const { listLink } = useSurveyResponseTagRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    surveyResponseTagsWithUsageCountQueryOptions({ projectSlug, includeArchived: true }),
  )
  const tag = data.surveyResponseTags.find((entry) => entry.id === tagId)

  if (!tag) {
    throw new Error(`Tag ${tagId} nicht gefunden`)
  }

  const closeModal = () => {
    void router.navigate({ ...listLink, replace: true })
  }

  return (
    <>
      <SurveyResponseTagsOverview projectSlug={projectSlug} />
      <FormModal title="Tag bearbeiten" onClose={closeModal}>
        <EditSurveyResponseTagForm
          tag={tag}
          projectSlug={projectSlug}
          layout="modal"
          onCancel={closeModal}
        />
      </FormModal>
    </>
  )
}
