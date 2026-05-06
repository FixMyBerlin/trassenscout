import { resolve } from "node:path"
import { styleText } from "node:util"

/**
 * Downloads CSV from Google Sheets and stores it under `configs/<configName>/` in `scriptRootDir`.
 */
export async function downloadAndStoreCsv(
  spreadsheetId: string,
  tableId: string,
  configName: string,
  scriptRootDir: string,
) {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${tableId}`

  console.log(styleText("inverse", " Fetching CSV from Google Sheets... "), { csvUrl })
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

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const csvFileName = configName ? `${configName}-${timestamp}.csv` : `csv-${timestamp}.csv`
  const csvFilePath = resolve(scriptRootDir, "configs", configName, csvFileName)

  try {
    await Bun.write(csvFilePath, csvContent)
    console.log("✓ CSV saved", { csvFilePath })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    console.error(`❌ Error saving CSV: ${message}`)
    process.exit(1)
  }

  return csvContent
}
