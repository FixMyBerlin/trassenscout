import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useRouter } from "@tanstack/react-router"
import { FormModal } from "@/src/components/core/components/Modal/FormModal"
import { TagsOverview } from "@/src/components/pages/tags/PageTags"
import { EditTagForm } from "@/src/components/tags/EditTagForm"
import { useTagRouteLinks } from "@/src/components/tags/useTagActions"
import { tagsWithUsageCountQueryOptions } from "@/src/server/tags/tagsQueryOptions"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/tags/$tagId/edit/")

export function PageTagsEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const tagId = Number(params.tagId)
  const router = useRouter()
  const { listLink } = useTagRouteLinks(projectSlug, preserveFromSearch(routeApi.useSearch()))
  const { data } = useSuspenseQuery(
    tagsWithUsageCountQueryOptions({ projectSlug, includeArchived: true }),
  )
  const tag = data.tags.find((entry) => entry.id === tagId)

  if (!tag) {
    throw new Error(`Tag ${tagId} nicht gefunden`)
  }

  const closeModal = () => {
    void router.navigate({ ...listLink, replace: true })
  }

  return (
    <>
      <TagsOverview projectSlug={projectSlug} />
      <FormModal title="Tag bearbeiten" onClose={closeModal} className="sm:max-w-2xl">
        <EditTagForm tag={tag} projectSlug={projectSlug} onCancel={closeModal} />
      </FormModal>
    </>
  )
}
