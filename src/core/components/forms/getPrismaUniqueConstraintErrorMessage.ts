import { errorMessageTranslations } from "./errorMessageTranslations"

export const getPrismaUniqueConstraintErrorMessage = (
  error: any,
  formError: string,
  fieldNames: string[],
) => {
  console.error(error)
  let result = { [formError]: error }
  // Check if it is a unique constraint error
  if (error.code === "P2002") {
    fieldNames.forEach((fieldName: string) => {
      // Check what field name is included and adapt return object accordingly
      if (error.meta?.target?.includes(fieldName)) {
        result[formError] = "Bitte korrigieren Sie Ihre Angaben."
        result[fieldName] =
          // check for translation
          errorMessageTranslations[error.toString().replaceAll("\n", "")] ||
          error.toString().replaceAll("\n", "")
      }
    })
  }
  return result
}
