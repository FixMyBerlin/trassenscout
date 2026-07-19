import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { EditContactForm } from "@/src/components/contacts/EditContactForm"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { contactQueryOptions } from "@/src/server/contacts/contactQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/contacts/$contactId/edit/")

export function PageContactsContactEdit() {
  const { projectSlug, contactId } = routeApi.useParams()
  const { data: contact } = useSuspenseQuery(
    contactQueryOptions({ projectSlug, id: Number(contactId) }),
  )

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Externe Kontakte"
            sectionTo="/$projectSlug/contacts"
            current="bearbeiten"
          />
        }
      />
      <EditContactForm contact={contact} projectSlug={projectSlug} />
    </>
  )
}
