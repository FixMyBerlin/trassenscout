import { TFeedback, TFeedbackQuestion, TQuestion, TSurvey } from "../components/types"

export const getQuestionsAsArray = ({
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
