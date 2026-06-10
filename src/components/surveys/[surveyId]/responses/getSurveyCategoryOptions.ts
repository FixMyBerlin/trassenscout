import { SurveyFieldRadioOrCheckboxGroupConfig } from "@/src/components/beteiligung/shared/types"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { getFlatSurveyFormFields } from "@/src/components/surveys/[surveyId]/responses/getFlatSurveyFormFields"
import { transformQuestionsOptions } from "@/src/components/surveys/[surveyId]/responses/transformQuestionsOptions"

export const getSurveyCategoryOptions = (slug: AllowedSurveySlugs) => {
  const feedbackDefinition = getConfigBySurveySlug(slug, "part2")
  const feedbackQuestions = getFlatSurveyFormFields(feedbackDefinition)
  const categoryId = getQuestionIdBySurveySlug(slug, "category")

  const categoryQuestion = feedbackQuestions.find(
    (q) => String(q.name) === String(categoryId),
  )! as SurveyFieldRadioOrCheckboxGroupConfig
  const categoryQuestionOptions = categoryQuestion.props.options

  return [...transformQuestionsOptions(categoryQuestionOptions)]
}
