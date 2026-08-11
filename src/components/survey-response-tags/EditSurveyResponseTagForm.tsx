import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { secondaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  useSurveyResponseTagMutations,
  useSurveyResponseTagRouteLinks,
} from "@/src/components/survey-response-tags/useSurveyResponseTagActions"
import { TagForm, type TagFormValues } from "@/src/components/tags/TagForm"

type Tag = {
  id: number
  title: string
  description: string | null
  archivedAt: Date | string | null
  usageCount: number
}

type Props = {
  tag: Tag
  projectSlug: string
  layout?: "page" | "modal"
  onCancel?: () => void
}

export const EditSurveyResponseTagForm = ({
  tag,
  projectSlug,
  layout = "page",
  onCancel,
}: Props) => {
  const { updateTag, deleteTag } = useSurveyResponseTagMutations(projectSlug)
  const { listLink, listHref } = useSurveyResponseTagRouteLinks(projectSlug)
  const isModalLayout = layout === "modal"

  const handleSubmit = async (values: TagFormValues) => {
    try {
      await updateTag(tag.id, values.title, values.description)
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
      variant={isModalLayout ? "text" : "icon"}
    />
  )

  return (
    <>
      <TagForm
        className={isModalLayout ? "max-w-none" : "grow"}
        submitText="Speichern"
        withDescription
        initialValues={{ title: tag.title, description: tag.description }}
        onSubmit={handleSubmit}
        actionBarLeft={isModalLayout ? deleteAction : undefined}
        actionBarRight={
          isModalLayout
            ? onCancel && (
                <button type="button" className={secondaryButtonClassName} onClick={onCancel}>
                  Abbrechen
                </button>
              )
            : deleteAction
        }
        submitPlacement={isModalLayout ? "right" : "left"}
        actionBarClassName={isModalLayout ? "border-b-0" : undefined}
        backLink={isModalLayout ? null : <BackLink {...listLink} text="Zurück zur Übersicht" />}
      />
      {!isModalLayout && <SuperAdminLogData data={{ tag }} />}
    </>
  )
}
