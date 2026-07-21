import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { NewInviteForm } from "@/src/components/invites/NewInviteForm"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/invites/new/")

export function PageInvitesNew() {
  const { projectSlug } = routeApi.useParams()
  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Einladungen"
            sectionTo="/$projectSlug/invites"
            current="neu"
          />
        }
      />
      <NewInviteForm projectSlug={projectSlug} />
    </>
  )
}
