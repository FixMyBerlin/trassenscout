import { useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { secondaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { isAdmin } from "@/src/components/shared/app/users/utils/isAdmin"
import { TagForm, type TagFormValues } from "@/src/components/tags/TagForm"
import { useTagMutations, useTagRouteLinks } from "@/src/components/tags/useTagActions"
import type { TagColorEnum } from "@/src/prisma/generated/browser"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

type Tag = {
  id: number
  title: string
  description: string | null
  color: TagColorEnum
  archivedAt: Date | string | null
  usageCount: number
}

type Props = {
  tag: Tag
  projectSlug: string
  onCancel: () => void
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/tags/$tagId/edit/")

export const EditTagForm = ({ tag, projectSlug, onCancel }: Props) => {
  const search = preserveFromSearch(routeApi.useSearch())
  const { updateTag, deleteTag } = useTagMutations(projectSlug, search)
  const { listHref } = useTagRouteLinks(projectSlug, search)
  const { data: user } = useQuery(currentUserQueryOptions())
  const userIsAdmin = isAdmin(user ?? null)

  const handleSubmit = async (values: TagFormValues) => {
    try {
      await updateTag(tag.id, {
        title: values.title,
        ...(userIsAdmin ? { description: values.description, color: values.color } : {}),
      })
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

  const deleteAction = (
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
      variant="text"
    />
  )

  return (
    <TagForm
      className="max-w-none"
      submitText="Speichern"
      withDescription={userIsAdmin}
      withColor={userIsAdmin}
      initialValues={{ title: tag.title, description: tag.description, color: tag.color }}
      onSubmit={handleSubmit}
      actionBarLeft={deleteAction}
      actionBarRight={
        <button type="button" className={secondaryButtonClassName} onClick={onCancel}>
          Abbrechen
        </button>
      }
      submitPlacement="right"
      actionBarClassName="border-b-0"
      backLink={null}
    />
  )
}
