import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { NewSurveyResponseTagForm } from "@/src/components/survey-response-tags/NewSurveyResponseTagForm"
import { useSurveyResponseTagRouteLinks } from "@/src/components/survey-response-tags/useSurveyResponseTagActions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/survey-response-tags/new/")

export function PageSurveyResponseTagsNew() {
  const { projectSlug } = routeApi.useParams()
  const { listLink } = useSurveyResponseTagRouteLinks(projectSlug)

  return (
    <>
      <PageHeader title="Tag hinzufügen" />
      <NewSurveyResponseTagForm projectSlug={projectSlug} />
      <Link {...listLink}>Zurück zu den Tags</Link>
    </>
  )
}
