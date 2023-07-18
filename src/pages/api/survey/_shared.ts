import { createObjectCsvStringifier } from "csv-writer"
import { NextApiRequest, NextApiResponse } from "next"
import { api } from "src/blitz-server"
import { getSession } from "@blitzjs/auth"

const DEBUG = false

export const authenticate = async (req: NextApiRequest, res: NextApiResponse) => {
  await api(() => null)
  const session = await getSession(req, res)
  const ok = session.userId && session.role === "ADMIN"
  if (!ok) {
    res.status(403).json({ error: true, status: 403, message: "Forbidden" })
    res.end()
  }
  return ok
}

export const sendCsv = (
  res: NextApiResponse,
  headers: { id: string; title: string }[],
  data: Record<string, any>[],
  filename: string,
) => {
  const csvStringifier = createObjectCsvStringifier({
    header: headers,
    fieldDelimiter: ";",
    alwaysQuote: true,
  })
  const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data)
  if (DEBUG) {
    res.setHeader("Content-Type", "text/plain")
  } else {
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`)
  }
  res.send(csvString)
}
