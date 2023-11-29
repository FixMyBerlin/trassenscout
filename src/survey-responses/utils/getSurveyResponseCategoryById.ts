import { TFeedbackQuestion, TResponse } from "src/survey-public/components/types"

export const getSurveyResponseCategoryById = (
  id: number,
  feedbackUserCategoryQuestion: TFeedbackQuestion,
  // @ts-expect-error
) => feedbackUserCategoryQuestion?.props?.responses.find((r: TResponse) => r.id === id).text.de
