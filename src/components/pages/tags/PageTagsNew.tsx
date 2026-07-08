import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { NewTagForm } from "@/src/components/tags/NewTagForm"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/tags/new/")

export function PageTagsNew() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <PageHeader title="Tag hinzufügen" />
      <NewTagForm projectSlug={projectSlug} />
    </>
  )
}
