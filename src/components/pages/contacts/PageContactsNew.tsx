import { getRouteApi } from "@tanstack/react-router"
import { NewContactForm } from "@/src/components/contacts/NewContactForm"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/contacts/new/")

export function PageContactsNew() {
  const { projectSlug } = routeApi.useParams()
  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Externe Kontakte"
            sectionTo="/$projectSlug/contacts"
            current="Kontakt hinzufügen"
          />
        }
        title="Kontakt hinzufügen"
      />
      <NewContactForm projectSlug={projectSlug} />
    </>
  )
}
