import { secondaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  useSurveyResponseTagMutations,
  useSurveyResponseTagRouteLinks,
} from "@/src/components/survey-response-tags/useSurveyResponseTagActions"
import { TagForm, type TagFormValues } from "@/src/components/tags/TagForm"

type Props = {
  projectSlug: string
  layout?: "page" | "modal"
  onCancel?: () => void
}

export const NewSurveyResponseTagForm = ({ projectSlug, layout = "page", onCancel }: Props) => {
  const { createTag } = useSurveyResponseTagMutations(projectSlug)
  const { listLink } = useSurveyResponseTagRouteLinks(projectSlug)
  const isModalLayout = layout === "modal"

  const handleSubmit = async (values: TagFormValues) => {
    try {
      await createTag(values.title, values.description)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["title"])
    }
  }

  return (
    <>
      <TagForm
        className={isModalLayout ? "max-w-none" : undefined}
        submitText="Erstellen"
        withDescription
        titleLabel={isModalLayout ? "Name" : undefined}
        onSubmit={handleSubmit}
        actionBarRight={
          isModalLayout && onCancel ? (
            <button type="button" className={secondaryButtonClassName} onClick={onCancel}>
              Abbrechen
            </button>
          ) : undefined
        }
        submitPlacement={isModalLayout ? "right" : "left"}
        actionBarClassName={isModalLayout ? "border-b-0" : undefined}
        backLink={isModalLayout ? null : <BackLink {...listLink} text="Zurück zur Übersicht" />}
      />
    </>
  )
}
