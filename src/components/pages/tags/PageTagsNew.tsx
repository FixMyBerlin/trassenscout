import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { NewTagForm } from "@/src/components/tags/NewTagForm"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/tags/new/")

export function PageTagsNew() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb section="Tags" sectionTo="/$projectSlug/tags" current="neu" />
        }
      />
      <NewTagForm projectSlug={projectSlug} />
    </>
  )
}
