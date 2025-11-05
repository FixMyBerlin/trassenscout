import { ImportSubsubsectionDataSchema } from "@/src/app/api/(apiKey)/subsubsections/import/route"
import { z } from "zod"

/**
 * Validates row data against the ImportSubsubsectionDataSchema
 * Returns error details if validation fails, null if valid
 * Uses the same schema as the API route to ensure consistency
 */
export function validateRow(mappedData: Record<string, any>) {
  try {
    // Validate the data (without subsectionId, as it's set by the API)
    // Use the same schema as the API route to ensure consistency
    const validationData = { ...mappedData, subsectionId: 1 } // Temporary, will be replaced by API
    ImportSubsubsectionDataSchema.parse(validationData)
    return null
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return error.errors.map((e) => {
        // Get the actual value from the path in mappedData
        const fieldPath = e.path
        let actualValue: any = mappedData
        for (const key of fieldPath) {
          actualValue = actualValue?.[key]
        }
        return {
          field: fieldPath.join("."),
          message: e.message,
          value: actualValue,
        }
      })
    }
    throw error
  }
}
