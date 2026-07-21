import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { EditTagForm } from "@/src/components/tags/EditTagForm"
import { tagsWithUsageCountQueryOptions } from "@/src/server/tags/tagsQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/tags/$tagId/edit/")

export function PageTagsEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const tagId = Number(params.tagId)
  const { data } = useSuspenseQuery(
    tagsWithUsageCountQueryOptions({ projectSlug, includeArchived: true }),
  )
  const tag = data.tags.find((entry) => entry.id === tagId)

  if (!tag) {
    throw new Error(`Tag ${tagId} nicht gefunden`)
  }

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Tags"
            sectionTo="/$projectSlug/tags"
            current="bearbeiten"
          />
        }
      />
      <EditTagForm tag={tag} projectSlug={projectSlug} />
    </>
  )
}
