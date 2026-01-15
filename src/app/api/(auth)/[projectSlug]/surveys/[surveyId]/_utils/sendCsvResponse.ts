import { createObjectCsvStringifier } from "csv-writer"

const DEBUG = false

/**
 * Creates a CSV response with proper headers.
 * Wraps csv-writer usage and returns a Response object for App Router.
 */
export function sendCsvResponse(
  headers: { id: string; title: string }[],
  data: Record<string, any>[],
  filename: string,
): Response {
  const csvStringifier = createObjectCsvStringifier({
    header: headers,
    fieldDelimiter: ";",
    alwaysQuote: true,
  })
  const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data)

  const responseHeaders: HeadersInit = DEBUG
    ? { "Content-Type": "text/plain" }
    : {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=${filename}`,
      }

  return new Response(csvString, { headers: responseHeaders })
}
