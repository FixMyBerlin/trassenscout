import { FieldConfig, SurveyPart1and3, SurveyPart2 } from "@/src/app/beteiligung-neu/_shared/types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung-neu/_shared/utils/allowedSurveySlugs"
import { isSurveyLegacy } from "@/src/survey-responses/utils/getConfigBySurveySlug"
import {
  TFeedback,
  TFeedbackQuestion,
  TQuestion,
  TSurvey,
} from "../../survey-public_legacy/components/types"

export const getQuestionsAsArrayLegacy = ({
  definition,
  surveyPart,
}: {
  definition: TSurvey | TFeedback
  surveyPart: "feedback" | "survey"
}) => {
  const questions = []
  for (let page of definition.pages) {
    page.questions && questions.push(...page.questions)
  }
  return surveyPart === "survey" ? (questions as TQuestion[]) : (questions as TFeedbackQuestion[])
}

export const getFieldsAsArray = ({ definition }: { definition: SurveyPart1and3 | SurveyPart2 }) => {
  const questions = []
  // console.log(definition.pages, "definition.pages", definition)
  for (let page of definition.pages) {
    page.fields && questions.push(...page.fields)
  }
  return questions as FieldConfig[]
}

export const getFlatSurveyQuestions = ({
  definition,
  surveyPart,
  slug,
}: {
  definition: TSurvey | TFeedback | SurveyPart1and3 | SurveyPart2
  slug: AllowedSurveySlugs
  surveyPart: "part1" | "part2" | "part3"
}) => {
  if (isSurveyLegacy(slug))
    return getQuestionsAsArrayLegacy({
      definition: definition as TSurvey | TFeedback,
      surveyPart: surveyPart === "part1" ? "survey" : "feedback",
    })
  return getFieldsAsArray({
    definition: definition as SurveyPart1and3 | SurveyPart2,
  })
}
