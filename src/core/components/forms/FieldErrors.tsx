import type { ValidationError } from "@tanstack/react-form"

type FieldErrorsProps = {
  errors: ValidationError[]
}

export const FieldErrors = ({ errors }: FieldErrorsProps) => {
  if (!errors.length) return null

  return (
    <div role="alert" className="mt-1 text-sm text-red-800">
      {errors.map((err, index) => (
        <span key={index}>
          {typeof err === "string"
            ? err
            : err && typeof err === "object" && "message" in err && typeof err.message === "string"
              ? err.message
              : String(err)}
          {index < errors.length - 1 ? ", " : ""}
        </span>
      ))}
    </div>
  )
}
