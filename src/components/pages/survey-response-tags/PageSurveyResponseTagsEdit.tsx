import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { EditSurveyResponseTagForm } from "@/src/components/survey-response-tags/EditSurveyResponseTagForm"
import { surveyResponseTagsWithUsageCountQueryOptions } from "@/src/server/surveyResponseTags/surveyResponseTagsQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/survey-response-tags/$tagId/edit/")

export function PageSurveyResponseTagsEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const tagId = Number(params.tagId)
  const { data } = useSuspenseQuery(
    surveyResponseTagsWithUsageCountQueryOptions({ projectSlug, includeArchived: true }),
  )
  const tag = data.surveyResponseTags.find((entry) => entry.id === tagId)

  if (!tag) {
    throw new Error(`Tag ${tagId} nicht gefunden`)
  }

  return (
    <>
      <PageHeader title="Tag bearbeiten" />
      <EditSurveyResponseTagForm tag={tag} projectSlug={projectSlug} />
    </>
  )
}
