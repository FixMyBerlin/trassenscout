import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { TagForm } from "@/src/components/tags/TagForm"
import { useTagMutations, useTagRouteLinks } from "@/src/components/tags/useTagActions"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

type Tag = {
  id: number
  title: string
  archivedAt: Date | string | null
  usageCount: number
}

type Props = {
  tag: Tag
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/tags/$tagId/edit/")

export const EditTagForm = ({ tag, projectSlug }: Props) => {
  const search = preserveFromSearch(routeApi.useSearch())
  const { updateTag, deleteTag } = useTagMutations(projectSlug, search)
  const { listLink, listHref } = useTagRouteLinks(projectSlug, search)

  const handleSubmit = async (values: { title: string }) => {
    try {
      await updateTag(tag.id, values.title)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["title"])
    }
  }

  const handleDelete = async () => {
    if (tag.usageCount > 0) {
      throw new Error("Tag wird noch verwendet und kann nicht gelöscht werden.")
    }
    await deleteTag(tag.id)
  }

  return (
    <>
      <TagForm
        className="grow"
        submitText="Speichern"
        initialValues={{ title: tag.title }}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={tag.title}
            onDelete={tag.usageCount > 0 ? undefined : handleDelete}
            onClick={
              tag.usageCount > 0
                ? async () => {
                    alert("Tag wird noch verwendet und kann nicht gelöscht werden.")
                  }
                : undefined
            }
            returnPath={listHref}
          />
        }
        backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      />
      <SuperAdminLogData data={{ tag }} />
    </>
  )
}
