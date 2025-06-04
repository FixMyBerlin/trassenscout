import { FieldConfig, SurveyPart1and3, SurveyPart2 } from "@/src/app/beteiligung/_shared/types"

export const getFieldsAsArray = ({ definition }: { definition: SurveyPart1and3 | SurveyPart2 }) => {
  const questions = []
  for (let page of definition.pages) {
    page.fields && questions.push(...page.fields.filter((field) => field.componentType === "form"))
  }
  return questions as FieldConfig[]
}

export const getFlatSurveyQuestions = (definition: SurveyPart1and3 | SurveyPart2 | null) => {
  if (!definition) return []
  return getFieldsAsArray({
    definition: definition,
  })
}
