import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { TagsTable } from "@/src/components/tags/TagsTable"
import { useTagRouteLinks } from "@/src/components/tags/useTagActions"
import { tagsWithUsageCountQueryOptions } from "@/src/server/tags/tagsQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/tags/")

export function PageTags() {
  const { projectSlug } = routeApi.useParams()
  const { newLink } = useTagRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    tagsWithUsageCountQueryOptions({ projectSlug, includeArchived: true }),
  )

  return (
    <>
      <PageHeader breadcrumb={<ProjectPageBreadcrumb section="Tags" />} title="Tags" />
      <TagsTable tags={data.tags} />
      <IfUserCanEdit>
        <Link button="blue" icon="plus" className="mt-4" {...newLink}>
          Neues Tag
        </Link>
      </IfUserCanEdit>
      <SuperAdminLogData data={{ tags: data.tags }} />
    </>
  )
}
