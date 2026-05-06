import { ImportSubsectionDataSchema } from "@/src/server/subsections/importSchema"
import { z } from "zod"

/**
 * Validates row data against ImportSubsectionDataSchema (same as API route)
 */
export function validateRow(mappedData: Record<string, any>) {
  try {
    const validationData = { ...mappedData, projectId: 1 }
    ImportSubsectionDataSchema.parse(validationData)
    return null
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return error.errors.map((e) => {
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
