import { AnyFieldApi } from "@tanstack/react-form"
import { useContext } from "react"
import { SurveyVisibleErrorContext } from "@/src/components/beteiligung/shared/contexts/contexts"

export const getFieldDescriptionId = (fieldName: string) => `${fieldName}-description`
const getFieldErrorId = (fieldName: string) => `${fieldName}-error`

export const getFieldA11yProps = ({
  description,
  fieldName,
  hasError,
  required,
}: {
  description?: string
  fieldName: string
  hasError: boolean
  required?: boolean
}) => {
  const describedBy = [
    description ? getFieldDescriptionId(fieldName) : null,
    hasError ? getFieldErrorId(fieldName) : null,
  ]
    .filter(Boolean)
    .join(" ")

  return {
    "aria-describedby": describedBy || undefined,
    "aria-errormessage": hasError ? getFieldErrorId(fieldName) : undefined,
    "aria-invalid": hasError || undefined,
    "aria-required": required || undefined,
  }
}

export const useFieldHasVisibleError = (field: AnyFieldApi) => {
  const { showErrors } = useContext(SurveyVisibleErrorContext)
  return showErrors && field.state.meta.errors.length > 0
}

export const FieldError = ({ field }: { field: AnyFieldApi }) => {
  // console.log("FieldError", field.state.meta.errors)
  // console.log("FieldErrorMap", field.state.meta.errorMap)
  const errors = field.state.meta.errors
  const hasError = useFieldHasVisibleError(field)

  return (
    // field.state.meta.isTouched && does not make sense here tbd
    <div className="pt-2">
      {hasError ? (
        <p id={getFieldErrorId(field.name)} className="text-sm font-semibold text-red-800">
          {errors.map((err) => err.message || err).join(",")}
        </p>
      ) : field.state.meta.isValidating ? (
        <p role="status" className="text-sm text-gray-600">
          Validating...
        </p>
      ) : null}
    </div>
  )
}
