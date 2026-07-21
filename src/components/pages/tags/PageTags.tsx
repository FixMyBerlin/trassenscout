import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { TagsTable } from "@/src/components/tags/TagsTable"
import { useTagRouteLinks } from "@/src/components/tags/useTagActions"
import { tagsWithUsageCountQueryOptions } from "@/src/server/tags/tagsQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/tags/")

export function PageTags() {
  const { projectSlug } = routeApi.useParams()
  const canEdit = useUserCan().edit
  const { newLink } = useTagRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    tagsWithUsageCountQueryOptions({ projectSlug, includeArchived: true }),
  )

  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Tags" />}
        primaryAction={
          canEdit ? (
            <Link button="blue" icon="plus" {...newLink}>
              Neues Tag
            </Link>
          ) : undefined
        }
      />
      <TagsTable tags={data.tags} />
      <SuperAdminLogData data={{ tags: data.tags }} />
    </>
  )
}
