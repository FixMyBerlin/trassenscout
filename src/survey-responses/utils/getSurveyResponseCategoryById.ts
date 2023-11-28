import { TFeedbackQuestion, TResponse } from "src/participation/data/types"

export const getSurveyResponseCategoryById = (
  id: number,
  feedbackUserCategoryQuestion: TFeedbackQuestion,
  // @ts-expect-error
) => feedbackUserCategoryQuestion?.props?.responses.find((r: TResponse) => r.id === id).text.de
