import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { MultiProjectInviteForm } from "@/src/components/invites/MultiProjectInviteForm"
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
      <MultiProjectInviteForm projectSlug={projectSlug} />
    </>
  )
}
