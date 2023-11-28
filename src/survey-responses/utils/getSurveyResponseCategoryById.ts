import { feedbackDefinition } from "src/participation/data/feedback"

export const getSurveyResponseCategoryById = (id: number) =>
  // @ts-ignore
  feedbackDefinition.pages[0]?.questions
    // @ts-ignore
    .find((e) => e.id === 21)
    // @ts-ignore
    .props.responses.find((r) => r.id === id).text.de
