import { AnyFieldApi } from "@tanstack/react-form"

export const FieldError = ({ field }: { field: AnyFieldApi }) => {
  // console.log("FieldError", field.state.meta.errors)
  // console.log("FieldErrorMap", field.state.meta.errorMap)
  return (
    // field.state.meta.isTouched && does not make sense here tbd
    <div className="pt-2">
      {!!field.state.meta.errors.length ? (
        <em className="text-red-500">
          {field.state.meta.errors.map((err) => err.message || err).join(",")}
        </em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </div>
  )
}
