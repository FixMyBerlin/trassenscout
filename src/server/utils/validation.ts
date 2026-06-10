import { z } from "zod"

export function validationErrorState(error: z.ZodError) {
  return {
    success: false as const,
    message: "Bitte korrigieren Sie die Fehler im Formular",
    errors: z.flattenError(error).fieldErrors,
  }
}
