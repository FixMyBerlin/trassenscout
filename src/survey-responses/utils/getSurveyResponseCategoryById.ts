import feedbackDefinition from "src/participation/data/feedback.json"

export const getSurveyResponseCategoryById = (id: number) =>
  feedbackDefinition.pages[0]?.questions
    // @ts-ignore
    .find((e) => e.id === 21)
    // @ts-ignore
    .props.responses.find((r) => r.id === id).text.de
