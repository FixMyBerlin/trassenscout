import { useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { secondaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { isAdmin } from "@/src/components/shared/app/users/utils/isAdmin"
import { DEFAULT_TAG_COLOR } from "@/src/components/tags/tagColors"
import { TagForm, type TagFormValues } from "@/src/components/tags/TagForm"
import { useTagMutations } from "@/src/components/tags/useTagActions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

type Props = {
  projectSlug: string
  onCancel: () => void
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/tags/new/")

export const NewTagForm = ({ projectSlug, onCancel }: Props) => {
  const search = preserveFromSearch(routeApi.useSearch())
  const { createTag } = useTagMutations(projectSlug, search)
  const { data: user } = useQuery(currentUserQueryOptions())
  const userIsAdmin = isAdmin(user ?? null)

  const handleSubmit = async (values: TagFormValues) => {
    try {
      await createTag({
        title: values.title,
        ...(userIsAdmin ? { description: values.description, color: values.color } : {}),
      })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["title"])
    }
  }

  return (
    <TagForm
      className="max-w-none"
      submitText="Erstellen"
      withDescription={userIsAdmin}
      withColor={userIsAdmin}
      initialValues={{ color: DEFAULT_TAG_COLOR }}
      onSubmit={handleSubmit}
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
