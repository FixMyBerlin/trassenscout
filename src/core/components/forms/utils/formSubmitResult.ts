export const FORM_ERROR = "FORM_ERROR"
export const FORM_CORRECTION_MESSAGE = "Bitte korrigieren Sie Ihre Angaben."

export interface OnSubmitResult {
  FORM_ERROR?: string
  [prop: string]: unknown
}

type FormWithErrorMap = {
  setErrorMap: (errorMap: { onSubmit: { fields: Record<string, string> } }) => void
}

export function applyFormSubmitResult(
  form: FormWithErrorMap,
  result: OnSubmitResult,
  setFormError: (error: string | null) => void,
) {
  const fieldErrors: Record<string, string> = {}

  for (const [key, errorValue] of Object.entries(result)) {
    if (key === FORM_ERROR) {
      if (errorValue && typeof errorValue === "object" && "name" in errorValue) {
        const name = errorValue.name
        const message = "message" in errorValue ? errorValue.message : undefined
        let parsedMessage = message
        if (name === "ZodError" && typeof message === "string") {
          try {
            parsedMessage = JSON.parse(message)
          } catch {}
        }
        setFormError(
          typeof parsedMessage === "string" ? parsedMessage : JSON.stringify(parsedMessage),
        )
      } else {
        setFormError(errorValue ? String(errorValue) : null)
      }
    } else {
      fieldErrors[key] = String(errorValue)
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    form.setErrorMap({
      onSubmit: { fields: fieldErrors },
    })
    if (!(FORM_ERROR in result)) {
      setFormError(null)
    }
  }
}
