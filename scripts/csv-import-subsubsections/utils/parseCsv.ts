import chalk from "chalk"
import { parse } from "papaparse"

/**
 * CSV row value type: CSV values are strings (trimmed) or null (for empty cells)
 */
export type CsvValue = string | null

/**
 * CSV row type: object with string keys and CsvValue values
 */
export type CsvRow = Record<string, CsvValue>

/**
 * Parses CSV content and validates required columns
 */
export function parseCsv(csvContent: string) {
  console.log(chalk.inverse(" Parsing CSV... "))

  const parseResult = parse<CsvRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
    transform: (value: string) => (value === "" ? null : value.trim()),
  })

  if (parseResult.errors.length > 0) {
    console.warn("⚠ CSV parsing warnings:")
    parseResult.errors.forEach((error: { message?: string; row?: number }) => {
      const message = error.message || "Unknown error"
      const row = error.row !== undefined ? error.row : "unknown"
      console.warn(`  - ${message} (row ${row})`)
    })
  }

  const rows = parseResult.data.filter(Boolean)
  console.log(`✓ Parsed ${rows.length} rows`)

  if (rows.length === 0) {
    console.error("❌ No rows found in CSV")
    process.exit(1)
  }

  // Required CSV columns
  const requiredColumns = ["project", "pa-slug", "slug"]

  // Check for required columns
  const firstRow = rows[0]
  if (!firstRow) {
    console.error("❌ CSV has no data rows")
    process.exit(1)
  }
  const headers = Object.keys(firstRow)
  const missingColumns = requiredColumns.filter((col) => !headers.includes(col))
  if (missingColumns.length > 0) {
    console.error(
      `❌ Missing required columns: ${missingColumns.join(", ")}\nAvailable columns: ${headers.join(", ")}`,
    )
    process.exit(1)
  }

  return rows
}
