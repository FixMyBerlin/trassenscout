import { createObjectCsvStringifier } from "csv-writer"
import { NextApiRequest, NextApiResponse } from "next"
import { api } from "src/blitz-server"
import { getSession } from "@blitzjs/auth"
import { AuthorizationError } from "blitz"
import { ZodError } from "zod"
import dbGetSurvey from "src/surveys/queries/admin/getSurvey"
import { Survey } from "db"

const DEBUG = false

export const getSurvey = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<undefined | Survey> => {
  await api(() => null)

  const err = (status: number, message: string) => {
    res.status(status).json({ error: true, status: status, message })
    res.end()
  }

  const session = await getSession(req, res)

  let survey
  try {
    // @ts-ignore
    survey = await dbGetSurvey({ id: Number(req.query.surveyId) }, { session })
  } catch (e) {
    if (e instanceof AuthorizationError) {
      err(403, "Forbidden")
    }
    // @ts-ignore
    if (e.code === "P2025" || e instanceof ZodError) {
      err(404, "Not Found")
    }

    console.error(e)
    err(500, "Internal Server Error")

    return
  }

  return survey
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
