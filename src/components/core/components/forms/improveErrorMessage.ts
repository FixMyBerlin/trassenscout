import { translateServerError } from "./errorMessageTranslations"

const SERVER_UNAVAILABLE_MESSAGE =
  "Der Server ist vorübergehend nicht erreichbar. Bitte versuchen Sie es in Kürze erneut. Eventuell muss dafür die Seite neu geladen werden."

export const improveErrorMessage = (error: any, formError: string, fieldNames: string[]) => {
  console.error(error)
  // Check if it is a unique constraint error
  if (error.code === "P2002") {
    return getPrismaUniqueConstraintErrorMessage(error, formError, fieldNames)
  }
  // Check for HTTP 502/503 (Bad Gateway / Service Unavailable) from Blitz RPC
  const statusCode = error?.statusCode ?? error?.status
  if (statusCode === 502 || statusCode === 503) {
    return { [formError]: SERVER_UNAVAILABLE_MESSAGE }
  }
  // Check for translated message by error string (e.g. from errorMessageTranslations)
  const errorKey = typeof error === "string" ? error : error?.message?.trim() || error?.toString?.()
  if (errorKey) {
    const translated = translateServerError(errorKey)
    if (translated !== errorKey) {
      return { [formError]: translated }
    }
  }
  // Return error as-is; FormError will display message or a safe fallback
  return { [formError]: error }
}

const getPrismaUniqueConstraintErrorMessage = (
  error: any,
  formError: string,
  fieldNames: string[],
) => {
  const result: Record<string, string> = {}
  let hasFieldErrors = false

  fieldNames.forEach((fieldName: string) => {
    if (error.meta?.target?.includes(fieldName)) {
      hasFieldErrors = true
      result[fieldName] = translateServerError(error.toString().replaceAll("\n", ""))
    }
  })

  if (hasFieldErrors) {
    // FormError shows FORM_CORRECTION_MESSAGE when field errors exist.
    return result
  }

  return { [formError]: error }
}
