import { SurveyPart1and3, SurveyPart2 } from "@/src/app/beteiligung-neu/_shared/types"
import { AnyFormApi } from "@tanstack/react-form"

export const pageHasErrors = ({
  part,
  form,
  page,
}: {
  part: SurveyPart1and3 | SurveyPart2
  form: AnyFormApi
  page: number
}) => {
  const fieldsToValidate = part.pages[page]?.fields
    .filter((field) => field.componentType === "form")
    .map((field) => field.name)
  // form.validateField() does not work as expected - it validates ALL fields of the form but only shows the errors in the fields of the respective fields

  const test = fieldsToValidate?.map((name) => {
    form.validateField(name, "submit")
  })

  // console.log({ errorMap: form.state.errorMap })
  // console.log({ error: form.state.errors })

  return (
    form.state.errorMap?.onSubmit &&
    fieldsToValidate?.some((key) => key in form.state.errorMap.onSubmit)
  )
}
