import {
  parseUniqueConstraintError,
  translateServerError,
  translateUniqueConstraintError,
} from "./errorMessageTranslations"

const SERVER_UNAVAILABLE_MESSAGE =
  "Der Server ist vorübergehend nicht erreichbar. Bitte versuchen Sie es in Kürze erneut. Eventuell muss dafür die Seite neu geladen werden."

export const improveErrorMessage = (error: any, formError: string, fieldNames: string[]) => {
  console.error(error)
  const rawMessage = typeof error === "string" ? error : error?.message || error?.toString?.() || ""
  const uniqueConstraint = parseUniqueConstraintError(rawMessage)
  if (uniqueConstraint) {
    const translated = translateUniqueConstraintError(uniqueConstraint)
    const affectedFields = fieldNames.filter((fieldName) =>
      uniqueConstraint.fields.includes(fieldName),
    )
    if (affectedFields.length) {
      return Object.fromEntries(affectedFields.map((fieldName) => [fieldName, translated]))
    }
    return { [formError]: translated }
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
