import { AnyFieldApi } from "@tanstack/react-form"

export const FieldError = ({ field }: { field: AnyFieldApi }) => {
  // console.log("FieldError", field.state.meta.errors)
  // console.log("FieldErrorMap", field.state.meta.errorMap)
  return (
    // field.state.meta.isTouched && does not make sense here tbd
    <div className="pl-2 pt-2">
      {!!field.state.meta.errors.length ? (
        <p id={field.name + " Hint"} className="text-sm font-semibold text-red-800">
          {field.state.meta.errors.map((err) => err.message || err).join(",")}
        </p>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </div>
  )
}
