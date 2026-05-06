import { downloadAndStoreCsv } from "../utils/downloadAndStoreCsv"
import { apiUrls, getApiKeyForEnv } from "../utils/env"
import { loadConfig, parseArgs } from "../utils/parseArgs"
import { parseCsv } from "../utils/parseCsv"
import { mapRowToSchema } from "./utils/mapRowToSchema"
import { sendToApi } from "./utils/sendToApi"
import { validateRow } from "./utils/validateRow"

const SCRIPT_ENTRY = "scripts/csv-import/subsections/index.ts"

async function main() {
  const { configName, env } = await parseArgs(SCRIPT_ENTRY)
  const config = await loadConfig(configName, import.meta.dir)
  const apiKey = getApiKeyForEnv(env)
  const apiUrl = apiUrls[env]
  const apiEndpoint = `${apiUrl}/api/subsections/import`

  console.log("=".repeat(80))
  console.log("CSV Import Script for Subsections (Planungsabschnitte)", { configName, env, apiUrl, config })
  console.log("=".repeat(80), "\n")

  const csvContent = await downloadAndStoreCsv(
    config.spreadsheetId,
    config.tableId,
    configName,
    import.meta.dir,
  )

  const rows = parseCsv(csvContent, ["project", "slug"])

  let processedCount = 0
  let skippedCount = 0
  let successCount = 0
  let errorCount = 0
  const errors: Array<{ row: number; reason: string; details?: any }> = []
  const unmatchedColumnsSet = new Set<string>()

  console.log("Processing rows...")
  console.log("-".repeat(80))

  for (const [i, row] of rows.entries()) {
    if (!row) continue

    const rowNum = i + 2

    const projectSlug = row["project"]?.toString().trim().toLowerCase()
    const subsectionSlug = row["slug"]?.toString().trim().toLowerCase()

    if (!projectSlug || !subsectionSlug) {
      skippedCount++
      const missing = []
      if (!projectSlug) missing.push("project")
      if (!subsectionSlug) missing.push("slug")
      console.log(`Row ${rowNum}: ❌ SKIPPED - Missing required fields: ${missing.join(", ")}`)
      continue
    }

    const { mappedData, unmatchedColumns } = mapRowToSchema(row)

    if (unmatchedColumns.length > 0) {
      unmatchedColumns.forEach((col) => unmatchedColumnsSet.add(col))
      const filteredUnmatched = unmatchedColumns.filter((col) => col !== "type")
      if (filteredUnmatched.length > 0) {
        console.log(`Row ${rowNum}: ⚠️  Unmatched columns: ${filteredUnmatched.join(", ")}`)
      }
    }

    if (!("geometry" in mappedData)) {
      console.log(
        `Row ${rowNum}: ℹ️  Geometry not provided - will preserve existing or use fallback`,
      )
    }

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

    processedCount++
    try {
      const result = await sendToApi(
        apiEndpoint,
        apiKey,
        env,
        projectSlug,
        subsectionSlug,
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
        const url = `${apiUrl}/${projectSlug}/abschnitte/${subsectionSlug}`
        console.log(
          `Row ${rowNum}: ✓ ${action.toUpperCase()} - ${projectSlug}/${subsectionSlug} → ${url}`,
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

  console.log("=".repeat(80))
  console.log("SUMMARY")
  console.log("=".repeat(80))
  console.log(`Total rows in CSV: ${rows.length}`)
  console.log(`Processed: ${processedCount}`)
  console.log(`Successful: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
  console.log(`Skipped: ${skippedCount}`)

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
