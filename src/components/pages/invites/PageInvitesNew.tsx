import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { NewInviteForm } from "@/src/components/invites/NewInviteForm"

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
            current="Teammitglied einladen"
          />
        }
        title="Teammitglied einladen"
      />
      <NewInviteForm projectSlug={projectSlug} />
    </>
  )
}
