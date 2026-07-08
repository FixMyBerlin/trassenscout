import { getRouteApi } from "@tanstack/react-router"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { TagForm } from "@/src/components/tags/TagForm"
import { useTagMutations, useTagRouteLinks } from "@/src/components/tags/useTagActions"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/tags/new/")

export const NewTagForm = ({ projectSlug }: Props) => {
  const search = preserveFromSearch(routeApi.useSearch())
  const { createTag } = useTagMutations(projectSlug, search)
  const { listLink } = useTagRouteLinks(projectSlug, search)

  const handleSubmit = async (values: { title: string }) => {
    try {
      await createTag(values.title)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["title"])
    }
  }

  return (
    <>
      <TagForm className="mt-10" submitText="Erstellen" onSubmit={handleSubmit} />
      <BackLink {...listLink} text="Zurück zur Übersicht" />
    </>
  )
}
