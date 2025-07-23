import { SurveyFieldRadioOrCheckboxGroupConfig } from "@/src/app/beteiligung/_shared/types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { getFlatSurveyFormFields } from "@/src/survey-responses/utils/getFlatSurveyFormFields"
import { transformQuestionsOptions } from "@/src/survey-responses/utils/transformQuestionsOptions"

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
