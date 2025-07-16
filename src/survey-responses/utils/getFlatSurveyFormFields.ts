import { FieldConfig, SurveyPart1and3, SurveyPart2 } from "@/src/app/beteiligung/_shared/types"

// Type that represents only form fields (excludes content fields)
type FormFieldConfig = Extract<FieldConfig, { componentType: "form" }>

export const getFieldsAsArray = ({ definition }: { definition: SurveyPart1and3 | SurveyPart2 }) => {
  const questions = []
  for (let page of definition.pages) {
    page.fields && questions.push(...page.fields.filter((field) => field.componentType === "form"))
  }
  return questions as FormFieldConfig[]
}

export const getFlatSurveyFormFields = (
  definition: SurveyPart1and3 | SurveyPart2 | null,
): FormFieldConfig[] => {
  if (!definition) return []
  return getFieldsAsArray({
    definition,
  })
}
