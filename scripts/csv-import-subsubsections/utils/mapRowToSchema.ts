import { SubsubsectionSchema } from "@/src/server/subsubsections/schema"
import type { CsvRow } from "./parseCsv"
import { validateAndExtractGeometry } from "./validateGeometry"

/**
 * Normalizes numeric string by handling comma/decimal separators
 * - If both comma and dot exist: remove commas (thousands separator)
 *   Example: "1,000.00" -> "1000.00"
 * - If only comma exists: replace with dot (decimal separator)
 *   Example: "1,11" -> "1.11"
 * - Otherwise: keep as-is
 */
function normalizeNumericString(value: string): string {
  const trimmed = value.trim()
  const hasComma = trimmed.includes(",")
  const hasDot = trimmed.includes(".")

  if (hasComma && hasDot) {
    // Both exist: comma is thousands separator, remove it
    return trimmed.replace(/,/g, "")
  } else if (hasComma && !hasDot) {
    // Only comma: it's a decimal separator, replace with dot
    return trimmed.replace(/,/g, ".")
  }

  // No comma or already has dot: keep as-is
  return trimmed
}

/**
 * Maps CSV row data to subsubsection schema format with type conversions
 */
export function mapRowToSchema(row: CsvRow) {
  const mappedData: Record<string, any> = {}
  const schemaShape = SubsubsectionSchema.shape
  let geometryProvided = false

  // Map standard fields (skip the ones we handle specially)
  const rowEntries = Object.entries(row || {})
  for (const [csvKey, csvValue] of rowEntries) {
    // Skip required CSV fields that are used for lookup only (not part of subsubsection data)
    if (csvKey === "project" || csvKey === "pa-slug") {
      continue
    }

    // Map slug field directly (it's required) - lowercase
    if (csvKey === "slug") {
      if (csvValue) {
        mappedData.slug = String(csvValue).trim().toLowerCase()
      }
      continue
    }

    // Handle slug fields - map to special field names that API will convert to IDs - lowercase
    if (
      csvKey === "qualityLevelSlug" ||
      csvKey === "subsubsectionStatusSlug" ||
      csvKey === "subsubsectionInfraSlug" ||
      csvKey === "subsubsectionTaskSlug"
    ) {
      const str = String(csvValue).trim().toLowerCase()
      if (str) {
        // Store with the slug field name - API will convert to ID
        mappedData[csvKey] = str
      }
      continue
    }

    // Skip empty values
    if (csvValue === null || csvValue === undefined || csvValue === "") {
      continue
    }

    // Map CSV column names to schema field names
    // Handle common variations and naming differences
    const normalizedKey = csvKey.toLowerCase().replace(/\s+/g, "").replace(/-/g, "")
    const originalKey = csvKey

    // Try to find matching field in schema
    let fieldName: string | undefined
    const possibleKeys = [
      normalizedKey,
      originalKey.toLowerCase(),
      originalKey.replace(/\s+/g, ""),
      originalKey.replace(/-/g, ""),
      originalKey,
    ]

    for (const key of possibleKeys) {
      if (key in schemaShape) {
        fieldName = key
        break
      }
    }

    if (!fieldName) {
      // Field doesn't match schema, skip it
      continue
    }

    // Handle special type conversions
    let value: any = csvValue

    // Handle geometry - validate and extract coordinates
    if (fieldName === "geometry") {
      geometryProvided = true
      // Check if geometry value is empty (null, undefined, empty string, or whitespace-only)
      const isEmpty =
        csvValue === null ||
        csvValue === undefined ||
        csvValue === "" ||
        (typeof csvValue === "string" && csvValue.trim() === "")

      if (isEmpty) {
        // Empty geometry value - mark as provided but empty
        value = undefined
      } else {
        const geometryResult = validateAndExtractGeometry(csvValue)
        if (geometryResult.isValid) {
          value = geometryResult.coordinates
        } else {
          // If validation fails, keep the original value so Zod can show it in error message
          // Parse JSON if string to show the actual value, not the string representation
          try {
            value = JSON.parse(csvValue)
          } catch {
            value = csvValue
          }
          // Note: Invalid geometry will NOT trigger fallback - only empty geometry does
        }
      }
    }
    // Handle enums - normalize to uppercase
    else if (fieldName === "type") {
      value = String(csvValue).toUpperCase().trim()
    } else if (fieldName === "location") {
      value = String(csvValue).toUpperCase().trim()
    } else if (fieldName === "labelPos") {
      value = String(csvValue).toLowerCase().trim()
    }
    // Handle booleans
    else if (fieldName === "isExistingInfra") {
      const str = String(csvValue).toLowerCase().trim()
      value = str === "true" || str === "1" || str === "yes" || str === "ja"
    }
    // Handle ID fields - try to parse as number, or leave as-is for API to handle
    else if (
      fieldName === "qualityLevelId" ||
      fieldName === "subsubsectionStatusId" ||
      fieldName === "subsubsectionInfraId" ||
      fieldName === "subsubsectionTaskId" ||
      fieldName === "subsubsectionInfrastructureTypeId" ||
      fieldName === "managerId"
    ) {
      const str = String(csvValue).trim()
      const parsed = Number(str)
      // If it's a valid number string, use it; otherwise set to null
      value = isNaN(parsed) ? null : parsed
    }
    // Handle numeric fields - normalize comma/decimal separators and parse as numbers
    else if (
      fieldName === "lengthM" ||
      fieldName === "width" ||
      fieldName === "widthExisting" ||
      fieldName === "costEstimate" ||
      fieldName === "maxSpeed" ||
      fieldName === "trafficLoad" ||
      fieldName === "planningPeriod" ||
      fieldName === "constructionPeriod" ||
      fieldName === "planningCosts" ||
      fieldName === "deliveryCosts" ||
      fieldName === "constructionCosts" ||
      fieldName === "landAcquisitionCosts" ||
      fieldName === "expensesOfficialOrders" ||
      fieldName === "expensesTechnicalVerification" ||
      fieldName === "nonEligibleExpenses" ||
      fieldName === "revenuesEconomicIncome" ||
      fieldName === "contributionsThirdParties" ||
      fieldName === "grantsOtherFunding" ||
      fieldName === "ownFunds"
    ) {
      // Normalize numeric string (handle comma as decimal or thousands separator)
      const normalized = normalizeNumericString(String(csvValue))
      const parsed = Number(normalized)
      // If parsing fails, keep original value (Zod will handle validation)
      value = isNaN(parsed) ? csvValue : parsed
    }
    // Numbers will be coerced by Zod, but we can ensure they're strings or numbers
    else {
      // Keep value as-is, Zod will handle coercion
      value = csvValue
    }

    mappedData[fieldName] = value
  }

  // Set required fields with defaults if not provided
  if (!mappedData.type) {
    mappedData.type = "ROUTE" // Default to ROUTE
  }
  if (!mappedData.labelPos) {
    mappedData.labelPos = "top" // Default to top
  }
  if (mappedData.isExistingInfra === undefined) {
    mappedData.isExistingInfra = false
  }
  if (
    mappedData.lengthM === undefined ||
    mappedData.lengthM === null ||
    mappedData.lengthM === ""
  ) {
    mappedData.lengthM = 0 // Default to 0 if not provided
  }

  // Handle geometry - if not provided or empty, set type to AREA and mark for fallback
  // Only use fallback if geometry column was empty (not if it was invalid)
  // Invalid geometry will be caught by Zod validation and reported as an error
  if (!geometryProvided || mappedData.geometry === undefined) {
    mappedData.type = "AREA" // Use point geometry type
    mappedData.geometry = [0, 0] // Placeholder - API will replace with subsection's bottom left corner

    // Prefix description with placeholder marker
    // Only add notice when geometry is empty (not when invalid)
    const existingDescription = mappedData.description || ""
    mappedData.description = existingDescription
      ? `‼️ Platzhalter-Geometrie\n\n${existingDescription}`
      : "‼️ Platzhalter-Geometrie"
  }

  return mappedData
}
