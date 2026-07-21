import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
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
