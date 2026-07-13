import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { NewInviteForm } from "@/src/components/invites/NewInviteForm"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/invites/new/")

export function PageInvitesNew() {
  const { projectSlug } = routeApi.useParams()
  return (
    <>
      <PageHeader title="Teammitglied einladen" />
      <NewInviteForm projectSlug={projectSlug} />
    </>
  )
}
