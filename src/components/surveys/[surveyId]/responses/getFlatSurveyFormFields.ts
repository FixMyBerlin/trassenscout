import {
  FieldConfig,
  SurveyPart1and3,
  SurveyPart2,
} from "@/src/components/beteiligung/shared/types"

// Type that represents only form fields (excludes content fields)
type FormFieldConfig = Extract<FieldConfig, { componentType: "form" }>

const getFieldsAsArray = ({ definition }: { definition: SurveyPart1and3 | SurveyPart2 }) => {
  const questions = []
  for (let page of definition.pages) {
    if (page.fields) {
      questions.push(...page.fields.filter((field) => field.componentType === "form"))
    }
  }
  return questions as FormFieldConfig[]
}

export const getFlatSurveyFormFields = (definition: SurveyPart1and3 | SurveyPart2 | null) => {
  if (!definition) return []
  return getFieldsAsArray({
    definition,
  })
}
