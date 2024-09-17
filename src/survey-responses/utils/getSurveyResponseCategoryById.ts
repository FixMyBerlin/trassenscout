import {
  TFeedbackQuestion,
  TResponse,
  TSingleOrMultiResponseProps,
} from "@/src/survey-public/components/types"

export const getSurveyResponseCategoryById = (
  id: number,
  feedbackUserCategoryQuestion: TFeedbackQuestion,
) => {
  const props = feedbackUserCategoryQuestion?.props as TSingleOrMultiResponseProps
  return props.responses.find((r: TResponse) => r.id === id)?.text.de
}
