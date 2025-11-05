import { downloadAndStoreCsv } from "./utils/downloadAndStoreCsv"
import { apiUrls, getApiKeyForEnv } from "./utils/env"
import { mapRowToSchema } from "./utils/mapRowToSchema"
import { loadConfig, parseArgs } from "./utils/parseArgs"
import { parseCsv } from "./utils/parseCsv"
import { sendToApi } from "./utils/sendToApi"
import { validateRow } from "./utils/validateRow"

async function main() {
  const { configName, env } = await parseArgs()
  const config = await loadConfig(configName)
  const apiKey = getApiKeyForEnv(env)
  const apiUrl = apiUrls[env]
  const apiEndpoint = `${apiUrl}/api/subsubsections/import`

  console.log("=".repeat(80))
  console.log("CSV Import Script for Subsubsections", { configName, env, apiUrl, config })
  console.log("=".repeat(80), "\n")

  // Download and store CSV
  const csvContent = await downloadAndStoreCsv(config.spreadsheetId, config.tableId, configName)

  // Parse CSV
  const rows = parseCsv(csvContent)

  // Statistics
  let processedCount = 0
  let skippedCount = 0
  let successCount = 0
  let errorCount = 0
  const errors: Array<{ row: number; reason: string; details?: any }> = []
  const unmatchedColumnsSet = new Set<string>()

  console.log("Processing rows...")
  console.log("-".repeat(80))

  // Process each row
  for (const [i, row] of rows.entries()) {
    if (!row) continue

    // Convert array index to CSV row number: row 1 is header (not in array), so array[0] = CSV row 2
    const rowNum = i + 2

    // Extract required fields - lowercase slugs
    const projectSlug = row["project"]?.toString().trim().toLowerCase()
    const subsectionSlug = row["pa-slug"]?.toString().trim().toLowerCase()
    const subsubsectionSlug = row["slug"]?.toString().trim().toLowerCase()

    // Check required fields
    if (!projectSlug || !subsectionSlug || !subsubsectionSlug) {
      skippedCount++
      const missing = []
      if (!projectSlug) missing.push("project")
      if (!subsectionSlug) missing.push("pa-slug")
      if (!subsubsectionSlug) missing.push("slug")
      console.log(`Row ${rowNum}: ❌ SKIPPED - Missing required fields: ${missing.join(", ")}`)
      continue
    }

    // Map CSV row to schema format
    const { mappedData, unmatchedColumns } = mapRowToSchema(row)

    // Track unmatched columns
    if (unmatchedColumns.length > 0) {
      unmatchedColumns.forEach((col) => unmatchedColumnsSet.add(col))
      console.log(`Row ${rowNum}: ⚠️  Unmatched columns: ${unmatchedColumns.join(", ")}`)
    }

    // Validate with Zod schema
    const validationErrors = validateRow(mappedData)
    if (validationErrors) {
      errorCount++
      errors.push({
        row: rowNum,
        reason: "Validation failed",
        details: validationErrors,
      })
      console.log(`Row ${rowNum}: ❌ VALIDATION ERROR`)
      validationErrors.forEach((detail) => {
        const valueStr =
          detail.value !== undefined ? ` (value: ${JSON.stringify(detail.value)})` : ""
        console.log(`  - ${detail.field}: ${detail.message}${valueStr}`)
      })
      continue
    }

    // Send to API
    processedCount++
    try {
      const result = await sendToApi(
        apiEndpoint,
        apiKey,
        env,
        projectSlug,
        subsectionSlug,
        subsubsectionSlug,
        config.userId,
        mappedData,
      )

      if (!result.success) {
        errorCount++
        errors.push({
          row: rowNum,
          reason: "API error",
          details: result.response,
        })
        console.log(`Row ${rowNum}: ❌ API ERROR`)
        if (result.response.error) {
          console.log(`  Error: ${result.response.error}`)
        }
        if (result.response.details) {
          result.response.details.forEach((detail) => {
            const path = detail.path || "unknown"
            const message = detail.message || "Unknown error"
            console.log(`  - ${path}: ${message}`)
          })
        }
      } else {
        successCount++
        const action = result.response.action || "updated"
        const url = `${apiUrl}/${projectSlug}/abschnitte/${subsectionSlug}/fuehrung/${subsubsectionSlug}`
        console.log(
          `Row ${rowNum}: ✓ ${action.toUpperCase()} - ${projectSlug}/${subsectionSlug}/${subsubsectionSlug} → ${url}`,
        )
      }
    } catch (error: unknown) {
      errorCount++
      const message = error instanceof Error ? error.message : "Unknown network error"
      errors.push({
        row: rowNum,
        reason: `Network error: ${message}`,
      })
      console.log(`Row ${rowNum}: ❌ NETWORK ERROR - ${message}`)
    }
  }

  console.log("-".repeat(80))

  // Summary
  console.log("=".repeat(80))
  console.log("SUMMARY")
  console.log("=".repeat(80))
  console.log(`Total rows in CSV: ${rows.length}`)
  console.log(`Processed: ${processedCount}`)
  console.log(`Successful: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
  console.log(`Skipped: ${skippedCount}`)

  // Report unmatched columns
  if (unmatchedColumnsSet.size > 0) {
    const unmatchedColumnsList = Array.from(unmatchedColumnsSet).sort()
    console.log("-".repeat(80))
    console.log("UNMATCHED COLUMNS:")
    console.log("-".repeat(80))
    console.log(
      "The following columns were not recognized and were ignored. Please use exact column names matching the schema.",
    )
    unmatchedColumnsList.forEach((col) => {
      console.log(`  - ${col}`)
    })
  }

  if (errors.length > 0) {
    console.log("ERRORS:")
    console.log("-".repeat(80))
    errors.forEach((item) => {
      console.log(`Row ${item.row}: ${item.reason}`)
      if (item.details) {
        if (Array.isArray(item.details)) {
          item.details.forEach((detail: any) => {
            console.log(
              `  - ${detail.field || detail.path || "unknown"}: ${detail.message || JSON.stringify(detail)}`,
            )
          })
        } else {
          console.log(`  Details: ${JSON.stringify(item.details, null, 2)}`)
        }
      }
    })
  }

  console.log("=".repeat(80))
  if (errorCount === 0 && skippedCount === 0) {
    console.log("✓ All rows processed successfully!")
  } else {
    console.log(`⚠ Completed with ${errorCount} errors and ${skippedCount} skipped rows`)
  }
  console.log("=".repeat(80))
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
