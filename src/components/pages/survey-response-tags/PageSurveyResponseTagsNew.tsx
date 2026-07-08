import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { NewSurveyResponseTagForm } from "@/src/components/survey-response-tags/NewSurveyResponseTagForm"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/survey-response-tags/new/")

export function PageSurveyResponseTagsNew() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <PageHeader title="Tag hinzufügen" />
      <NewSurveyResponseTagForm projectSlug={projectSlug} />
    </>
  )
}
