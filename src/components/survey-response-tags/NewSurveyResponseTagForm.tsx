import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  useSurveyResponseTagMutations,
  useSurveyResponseTagRouteLinks,
} from "@/src/components/survey-response-tags/useSurveyResponseTagActions"
import { TagForm } from "@/src/components/tags/TagForm"

type Props = {
  projectSlug: string
}

export const NewSurveyResponseTagForm = ({ projectSlug }: Props) => {
  const { createTag } = useSurveyResponseTagMutations(projectSlug)
  const { listLink } = useSurveyResponseTagRouteLinks(projectSlug)

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
