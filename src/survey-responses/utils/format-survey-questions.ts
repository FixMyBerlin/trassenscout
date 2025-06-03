import {
  SurveyFieldRadioOrCheckboxGroupConfig,
  SurveyPart1and3,
} from "@/src/app/beteiligung-neu/_shared/types"

type QuestionObject = {
  id: string
  label: string
  component: "singleResponse" | "multipleResponse"
  options: { key: string; label: string }[]
}

const transformMultiAndSingleQuestion = (
  field: SurveyFieldRadioOrCheckboxGroupConfig,
): QuestionObject => {
  return {
    id: field.name,
    label: field.props.label,
    // for the charts we only want the multi and single response questions to be displayed, we know that the component is either singleResponse or multipleResponse
    component: field.component === "SurveyRadiobuttonGroup" ? "singleResponse" : "multipleResponse",
    options: field.props.options,
  }
}

export const extractAndTransformQuestionsFromPages = (
  pages: SurveyPart1and3["pages"],
): QuestionObject[] => {
  const transformedArray: QuestionObject[] = []

  pages.forEach((page) => {
    if (!page.fields || page.fields.length === 0) return
    const transformedQuestions = page.fields
      .map((field) => {
        // for the charts we only want the multi and single response questions to be displayed
        if (["SurveyRadiobuttonGroup", "SurveyCheckboxGroup"].includes(field.component))
          return transformMultiAndSingleQuestion(field as SurveyFieldRadioOrCheckboxGroupConfig)
      })
      .filter(Boolean)
    transformedArray.push(...transformedQuestions)
  })
  return transformedArray
}
