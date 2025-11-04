import chalk from "chalk"
import { resolve } from "node:path"

/**
 * Downloads CSV from Google Sheets and stores it locally for inspection
 */
export async function downloadAndStoreCsv(
  spreadsheetId: string,
  tableId: string,
  configName: string,
) {
  // Get script directory: go up one level from utils/ to the script directory
  const scriptDir = resolve(import.meta.dir, "..")
  // Fetch Google Sheets as CSV
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${tableId}`

  console.log(chalk.inverse(" Fetching CSV from Google Sheets... "), { csvUrl })
  let csvContent: string
  try {
    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }
    const text = await response.text()
    if (!text) {
      throw new Error("Empty CSV content received")
    }
    csvContent = text
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    console.error(`❌ Error fetching CSV: ${message}`)
    process.exit(1)
  }

  console.log(`✓ CSV fetched (${csvContent.length} characters)`)

  // Save CSV file for inspection
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const csvFileName = configName ? `${configName}-${timestamp}.csv` : `csv-${timestamp}.csv`
  const csvFilePath = resolve(scriptDir, "configs", configName, csvFileName)

  try {
    // Bun.write() automatically creates directories if they don't exist
    await Bun.write(csvFilePath, csvContent)
    console.log("✓ CSV saved", { csvFilePath })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    console.error(`❌ Error saving CSV: ${message}`)
    process.exit(1)
  }

  return csvContent
}
