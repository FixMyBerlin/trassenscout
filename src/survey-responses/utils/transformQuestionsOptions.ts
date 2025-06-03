import { SurveyFieldRadioOrCheckboxGroupConfig } from "@/src/app/beteiligung-neu/_shared/types"

export const transformQuestionsOptions = (
  options: SurveyFieldRadioOrCheckboxGroupConfig["props"]["options"],
) => {
  return options.map((option) => {
    return { label: option.label, value: String(option.key) }
  })
}
