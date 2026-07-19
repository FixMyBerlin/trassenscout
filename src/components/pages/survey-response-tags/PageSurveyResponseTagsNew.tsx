import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { NewSurveyResponseTagForm } from "@/src/components/survey-response-tags/NewSurveyResponseTagForm"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/survey-response-tags/new/")

export function PageSurveyResponseTagsNew() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Tags (Beteiligung)"
            sectionTo="/$projectSlug/survey-response-tags"
            current="neu"
          />
        }
      />
      <NewSurveyResponseTagForm projectSlug={projectSlug} />
    </>
  )
}
