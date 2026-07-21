import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { EditProjectClient } from "@/src/components/projects/EditProjectClient"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { projectUsersQueryOptions } from "@/src/server/memberships/projectUsersQueryOptions"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/edit/")

export function PageProjectEdit() {
  const { projectSlug } = routeApi.useParams()
  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))
  const { data: users } = useSuspenseQuery(projectUsersQueryOptions({ projectSlug }))

  return (
    <>
      <PageHeader breadcrumb={<ProjectPageBreadcrumb current="bearbeiten" />} />
      <EditProjectClient initialProject={project} initialUsers={users} />
      <SuperAdminLogData data={project} />
    </>
  )
}
