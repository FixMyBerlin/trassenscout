import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  useSurveyResponseTagMutations,
  useSurveyResponseTagRouteLinks,
} from "@/src/components/survey-response-tags/useSurveyResponseTagActions"
import { TagForm } from "@/src/components/tags/TagForm"

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

export const EditSurveyResponseTagForm = ({ tag, projectSlug }: Props) => {
  const { updateTag, deleteTag } = useSurveyResponseTagMutations(projectSlug)
  const { listLink, listHref } = useSurveyResponseTagRouteLinks(projectSlug)

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
      />
      <BackLink {...listLink} text="Zurück zur Übersicht" />
      <SuperAdminLogData data={{ tag }} />
    </>
  )
}
