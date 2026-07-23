import { AnyFieldApi } from "@tanstack/react-form"

export const getFieldDescriptionId = (fieldName: string) => `${fieldName}-description`
const getFieldErrorId = (fieldName: string) => `${fieldName}-error`

export const getFieldA11yProps = ({
  description,
  fieldName,
  hasError,
}: {
  description?: string
  fieldName: string
  hasError: boolean
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
  }
}

export const FieldError = ({ field }: { field: AnyFieldApi }) => {
  // console.log("FieldError", field.state.meta.errors)
  // console.log("FieldErrorMap", field.state.meta.errorMap)
  const errors = field.state.meta.errors

  return (
    // field.state.meta.isTouched && does not make sense here tbd
    <div className="pt-2">
      {errors.length ? (
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
