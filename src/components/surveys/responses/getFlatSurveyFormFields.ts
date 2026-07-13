import {
  FieldConfig,
  SurveyPart1and3,
  SurveyPart2,
} from "@/src/components/beteiligung/shared/types"

type FormFieldConfig = Extract<FieldConfig, { componentType: "form" }>

const getFieldsAsArray = ({ definition }: { definition: SurveyPart1and3 | SurveyPart2 }) => {
  const questions: FormFieldConfig[] = []
  for (const page of definition.pages) {
    if (page.fields) {
      questions.push(...page.fields.filter((field) => field.componentType === "form"))
    }
  }
  return questions
}

export const getFlatSurveyFormFields = (definition: SurveyPart1and3 | SurveyPart2 | null) => {
  if (!definition) return []
  return getFieldsAsArray({ definition })
}
