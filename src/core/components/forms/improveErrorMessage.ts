import type { SubmitResult } from "@/src/core/components/forms/types"
import { errorMessageTranslations } from "./errorMessageTranslations"

const SERVER_UNAVAILABLE_MESSAGE =
  "Der Server ist vorübergehend nicht erreichbar. Bitte versuchen Sie es in Kürze erneut. Eventuell muss dafür die Seite neu geladen werden."

export const improveErrorMessage = (error: any, fieldNames: string[]): SubmitResult => {
  console.error(error)

  if (error.code === "P2002") {
    return getPrismaUniqueConstraintErrorMessage(error, fieldNames)
  }

  const statusCode = error?.statusCode ?? error?.status
  if (statusCode === 502 || statusCode === 503) {
    return { success: false, message: SERVER_UNAVAILABLE_MESSAGE }
  }

  const errorKey = typeof error === "string" ? error : error?.message?.trim() || error?.toString?.()
  if (errorKey && errorMessageTranslations[errorKey]) {
    return { success: false, message: errorMessageTranslations[errorKey]! }
  }

  const message =
    typeof error === "string"
      ? error
      : error?.message || "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
  return { success: false, message }
}

const getPrismaUniqueConstraintErrorMessage = (error: any, fieldNames: string[]): SubmitResult => {
  const errors: Record<string, string[]> = {}
  let hasFieldError = false

  for (const fieldName of fieldNames) {
    if (error.meta?.target?.includes(fieldName)) {
      hasFieldError = true
      const translated =
        errorMessageTranslations[error.toString().replaceAll("\n", "")] ||
        error.toString().replaceAll("\n", "")
      errors[fieldName] = [translated]
    }
  }

  if (hasFieldError) {
    return {
      success: false,
      message: "Bitte korrigieren Sie Ihre Angaben.",
      errors,
    }
  }

  const message =
    errorMessageTranslations[error.toString().replaceAll("\n", "")] ||
    error.toString().replaceAll("\n", "")
  return { success: false, message }
}
