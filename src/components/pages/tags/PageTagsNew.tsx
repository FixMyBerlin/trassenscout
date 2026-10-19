import { getRouteApi, useRouter } from "@tanstack/react-router"
import { FormModal } from "@/src/components/core/components/Modal/FormModal"
import { TagsOverview } from "@/src/components/pages/tags/PageTags"
import { NewTagForm } from "@/src/components/tags/NewTagForm"
import { useTagRouteLinks } from "@/src/components/tags/useTagActions"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/tags/new/")

export function PageTagsNew() {
  const { projectSlug } = routeApi.useParams()
  const router = useRouter()
  const { listLink } = useTagRouteLinks(projectSlug, preserveFromSearch(routeApi.useSearch()))

  const closeModal = () => {
    void router.navigate({ ...listLink, replace: true })
  }

  return (
    <>
      <TagsOverview projectSlug={projectSlug} />
      <FormModal title="Tag hinzufügen" onClose={closeModal} className="sm:max-w-2xl">
        <NewTagForm projectSlug={projectSlug} onCancel={closeModal} />
      </FormModal>
    </>
  )
}
