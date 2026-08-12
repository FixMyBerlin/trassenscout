import { SurveyFieldRadioOrCheckboxGroupConfig } from "@/src/components/beteiligung/shared/types"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { getFlatSurveyFormFields } from "@/src/components/surveys/[surveyId]/responses/getFlatSurveyFormFields"
import { transformQuestionsOptions } from "@/src/components/surveys/[surveyId]/responses/transformQuestionsOptions"

/** Category radio/checkbox options for response filters. Empty when the survey has no `category` field. */
export const getSurveyCategoryOptions = (slug: AllowedSurveySlugs) => {
  const feedbackDefinition = getConfigBySurveySlug(slug, "part2")
  if (!feedbackDefinition) return []

  const feedbackQuestions = getFlatSurveyFormFields(feedbackDefinition)
  const categoryId = getQuestionIdBySurveySlug(slug, "category")

  const categoryQuestion = feedbackQuestions.find((q) => String(q.name) === String(categoryId)) as
    | SurveyFieldRadioOrCheckboxGroupConfig
    | undefined

  const options = categoryQuestion?.props?.options
  if (!options?.length) return []

  return [...transformQuestionsOptions(options)]
}
