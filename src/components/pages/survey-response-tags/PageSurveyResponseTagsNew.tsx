import { getRouteApi, useRouter } from "@tanstack/react-router"
import { FormModal } from "@/src/components/core/components/Modal/FormModal"
import { SurveyResponseTagsOverview } from "@/src/components/pages/survey-response-tags/PageSurveyResponseTags"
import { NewSurveyResponseTagForm } from "@/src/components/survey-response-tags/NewSurveyResponseTagForm"
import { useSurveyResponseTagRouteLinks } from "@/src/components/survey-response-tags/useSurveyResponseTagActions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/survey-response-tags/new/")

export function PageSurveyResponseTagsNew() {
  const { projectSlug } = routeApi.useParams()
  const router = useRouter()
  const { listLink } = useSurveyResponseTagRouteLinks(projectSlug)

  const closeModal = () => {
    void router.navigate({ ...listLink, replace: true })
  }

  return (
    <>
      <SurveyResponseTagsOverview projectSlug={projectSlug} />
      <FormModal title="Tag hinzufügen" onClose={closeModal} className="sm:max-w-2xl">
        <NewSurveyResponseTagForm projectSlug={projectSlug} layout="modal" onCancel={closeModal} />
      </FormModal>
    </>
  )
}
