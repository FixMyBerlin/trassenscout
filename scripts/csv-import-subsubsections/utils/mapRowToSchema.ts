import { SubsubsectionSchema } from "@/src/server/subsubsections/schema"
import type { CsvRow } from "./parseCsv"

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
 * Returns mapped data and list of unmatched columns
 */
export function mapRowToSchema(row: CsvRow) {
  const mappedData: Record<string, any> = {}
  const schemaShape = SubsubsectionSchema.shape
  const unmatchedColumns: string[] = []

  // Map standard fields
  const rowEntries = Object.entries(row || {})
  for (const [csvKey, csvValue] of rowEntries) {
    // Skip required CSV fields that are used for lookup only (not part of subsubsection data)
    if (csvKey === "project" || csvKey === "pa-slug") {
      continue
    }

    // Handle slug field
    if (csvKey === "slug") {
      if (csvValue) {
        mappedData.slug = String(csvValue).trim().toLowerCase()
      }
      continue
    }

    // Handle special slug fields - these are not in schema
    // Map to special field names that API will convert to IDs - lowercase
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

    // If field doesn't match schema and isn't a special case, track it as unmatched
    // Check if column name exactly matches a schema field
    const fieldName = csvKey in schemaShape ? csvKey : undefined
    if (!fieldName) {
      unmatchedColumns.push(csvKey)
      continue
    }

    // Skip empty values for all fields (including geometry)
    // API route will preserve existing geometry on updates or add fallback for new records
    if (
      csvValue === null ||
      csvValue === undefined ||
      csvValue === "" ||
      (typeof csvValue === "string" && csvValue.trim() === "")
    ) {
      continue
    }

    // Handle geometry column - parse JSON if string, otherwise pass on as-is
    // Zod validation in validateRow will check and report errors
    if (csvKey === "geometry") {
      // Try to parse JSON - if it fails (invalid JSON or non-string), pass through as-is
      try {
        mappedData.geometry = JSON.parse(csvValue)
      } catch {
        // If JSON parse fails, pass through value - Zod will handle validation
        mappedData.geometry = csvValue
      }
      continue
    }

    // Handle special type conversions
    let value: any = csvValue
    // Handle enums - normalize to uppercase
    if (fieldName === "type") {
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
    mappedData.type = "AREA" // Fallback to AREA (Which is POINT)
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

  // CSV script only transforms geometry column to Position array or undefined
  // API route handles all fallback logic including placeholder geometry and description warnings
  return { mappedData, unmatchedColumns }
}
