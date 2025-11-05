import {
  PositionArraySchema,
  PositionSchema,
  SubsubsectionSchema,
} from "@/src/server/subsubsections/schema"
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
    // Skip empty values for all fields
    // API route will preserve existing geometry on updates or add fallback for new records
    if (
      csvValue === null ||
      csvValue === undefined ||
      csvValue === "" ||
      (typeof csvValue === "string" && csvValue.trim() === "")
    ) {
      continue
    }

    switch (csvKey) {
      case "project":
      case "pa-slug":
        // Skip lookup-only fields
        continue
      case "slug":
        // Handle slug field
        mappedData.slug = String(csvValue).trim().toLowerCase()
        continue
      case "qualityLevelSlug":
      case "subsubsectionStatusSlug":
      case "subsubsectionInfraSlug":
      case "subsubsectionTaskSlug":
        // Handle special slug fields - API will convert to IDs
        mappedData[csvKey] = String(csvValue).trim().toLowerCase()
        continue
      case "geometry": {
        // Parse JSON if string, otherwise pass on as-is
        let geometry: unknown
        try {
          geometry = JSON.parse(csvValue)
        } catch {
          // If JSON parse fails, pass through value - Zod will handle validation
          geometry = csvValue
        }
        mappedData.geometry = geometry

        // Infer type from geometry: Point (AREA) vs LineString (ROUTE)
        const pointResult = PositionSchema.safeParse(geometry)
        const lineStringResult = PositionArraySchema.safeParse(geometry)
        if (pointResult.success) {
          mappedData.type = "AREA"
        } else if (lineStringResult.success) {
          mappedData.type = "ROUTE"
        }
        // If geometry is invalid, don't set type - let Zod validation handle it
        continue
      }
      case "type":
        // Type is inferred from geometry - track as unmatched if provided
        unmatchedColumns.push(csvKey)
        continue
      case "location":
        // Handle enum - normalize to uppercase
        mappedData[csvKey] = String(csvValue).toUpperCase().trim()
        continue
      case "labelPos":
        // Handle enum - normalize to lowercase
        mappedData[csvKey] = String(csvValue).toLowerCase().trim()
        continue
      case "isExistingInfra": {
        // Handle boolean
        const str = String(csvValue).toLowerCase().trim()
        mappedData[csvKey] = str === "true" || str === "1" || str === "yes" || str === "ja"
        continue
      }
      case "qualityLevelId":
      case "subsubsectionStatusId":
      case "subsubsectionInfraId":
      case "subsubsectionTaskId":
      case "subsubsectionInfrastructureTypeId":
      case "managerId": {
        // Handle ID fields - try to parse as number
        const str = String(csvValue).trim()
        const parsed = Number(str)
        mappedData[csvKey] = isNaN(parsed) ? null : parsed
        continue
      }
      case "lengthM":
      case "width":
      case "widthExisting":
      case "costEstimate":
      case "maxSpeed":
      case "trafficLoad":
      case "planningPeriod":
      case "constructionPeriod":
      case "planningCosts":
      case "deliveryCosts":
      case "constructionCosts":
      case "landAcquisitionCosts":
      case "expensesOfficialOrders":
      case "expensesTechnicalVerification":
      case "nonEligibleExpenses":
      case "revenuesEconomicIncome":
      case "contributionsThirdParties":
      case "grantsOtherFunding":
      case "ownFunds": {
        // Handle numeric fields - normalize comma/decimal separators and parse as numbers
        const normalized = normalizeNumericString(String(csvValue))
        const parsed = Number(normalized)
        mappedData[csvKey] = isNaN(parsed) ? csvValue : parsed
        continue
      }
      default: {
        // Check if column name exactly matches a schema field
        const fieldName = csvKey in schemaShape ? csvKey : undefined
        if (!fieldName) {
          // Unmatched column - add to list and skip
          unmatchedColumns.push(csvKey)
          continue
        }
        // Schema field not explicitly handled - keep value as-is, Zod will handle coercion
        mappedData[fieldName] = csvValue
        continue
      }
    }
  }

  // Set required fields with defaults if not provided
  // Type is inferred from geometry - only set when geometry is provided
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
