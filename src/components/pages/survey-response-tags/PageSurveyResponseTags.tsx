import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { SurveyResponseTagsTable } from "@/src/components/survey-response-tags/SurveyResponseTagsTable"
import { useSurveyResponseTagRouteLinks } from "@/src/components/survey-response-tags/useSurveyResponseTagActions"
import { surveyResponseTagsWithUsageCountQueryOptions } from "@/src/server/surveyResponseTags/surveyResponseTagsQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/survey-response-tags/")

export function PageSurveyResponseTags() {
  const { projectSlug } = routeApi.useParams()
  const { newLink } = useSurveyResponseTagRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    surveyResponseTagsWithUsageCountQueryOptions({ projectSlug, includeArchived: true }),
  )

  return (
    <>
      <PageHeader breadcrumb={<ProjectPageBreadcrumb section="Tags (Beteiligung)" />} />
      <SurveyResponseTagsTable tags={data.surveyResponseTags} />
      <IfUserCanEdit>
        <Link button="blue" icon="plus" className="mt-4" {...newLink}>
          Neues Tag
        </Link>
      </IfUserCanEdit>
      <SuperAdminLogData data={{ tags: data.surveyResponseTags }} />
    </>
  )
}
