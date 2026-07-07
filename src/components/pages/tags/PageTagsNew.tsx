import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { NewTagForm } from "@/src/components/tags/NewTagForm"
import { useTagRouteLinks } from "@/src/components/tags/useTagActions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/tags/new/")

export function PageTagsNew() {
  const { projectSlug } = routeApi.useParams()
  const { listLink } = useTagRouteLinks(projectSlug)

  return (
    <>
      <PageHeader title="Tag hinzufügen" />
      <NewTagForm projectSlug={projectSlug} />
      <Link {...listLink}>Zurück zu den Tags</Link>
    </>
  )
}
