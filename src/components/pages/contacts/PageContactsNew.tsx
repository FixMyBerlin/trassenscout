import { getRouteApi } from "@tanstack/react-router"
import { NewContactForm } from "@/src/components/contacts/NewContactForm"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/contacts/new/")

export function PageContactsNew() {
  const { projectSlug } = routeApi.useParams()
  return (
    <>
      <PageHeader title="Kontakt hinzufügen" />
      <NewContactForm projectSlug={projectSlug} />
    </>
  )
}
