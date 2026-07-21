import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { SurveyResponseTagsTable } from "@/src/components/survey-response-tags/SurveyResponseTagsTable"
import { useSurveyResponseTagRouteLinks } from "@/src/components/survey-response-tags/useSurveyResponseTagActions"
import { surveyResponseTagsWithUsageCountQueryOptions } from "@/src/server/surveyResponseTags/surveyResponseTagsQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/survey-response-tags/")

export function PageSurveyResponseTags() {
  const { projectSlug } = routeApi.useParams()
  const canEdit = useUserCan().edit
  const { newLink } = useSurveyResponseTagRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    surveyResponseTagsWithUsageCountQueryOptions({
      projectSlug,
      includeArchived: true,
    }),
  )

  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Tags (Beteiligung)" />}
        primaryAction={
          canEdit ? (
            <Link button="blue" icon="plus" {...newLink}>
              Neues Tag
            </Link>
          ) : undefined
        }
      />
      <SurveyResponseTagsTable tags={data.surveyResponseTags} />
      <SuperAdminLogData data={{ tags: data.surveyResponseTags }} />
    </>
  )
}
