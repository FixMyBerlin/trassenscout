import { PositionArraySchema, PositionSchema } from "@/src/server/subsubsections/schema"

/**
 * Validates geometry input - must be either PositionSchema or PositionArraySchema
 * Returns coordinates if valid, error with value if invalid
 */
export function validateAndExtractGeometry(input: string | object) {
  // Parse JSON if string
  let parsed: unknown
  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input)
    } catch {
      return {
        coordinates: undefined,
        isValid: false,
        error: `Invalid JSON: ${input}`,
      }
    }
  } else {
    parsed = input
  }

  // Check if it matches PositionSchema (Point: [number, number])
  const pointResult = PositionSchema.safeParse(parsed)
  if (pointResult.success) {
    return {
      coordinates: pointResult.data,
      isValid: true,
    }
  }

  // Check if it matches PositionArraySchema (LineString: [[number, number], ...])
  const lineStringResult = PositionArraySchema.safeParse(parsed)
  if (lineStringResult.success) {
    return {
      coordinates: lineStringResult.data,
      isValid: true,
    }
  }

  // Invalid format
  return {
    coordinates: undefined,
    isValid: false,
    error: `Invalid geometry format. Expected Point [number, number] or LineString [[number, number], ...]. Got: ${JSON.stringify(parsed)}`,
  }
}
