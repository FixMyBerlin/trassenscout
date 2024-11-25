import { api } from "@/src/blitz-server"
import dbGetSurvey from "@/src/surveys/queries/getSurvey"
import { getSession } from "@blitzjs/auth"
import { AuthorizationError } from "blitz"
import { createObjectCsvStringifier } from "csv-writer"
import { NextApiRequest, NextApiResponse } from "next"
import { ZodError } from "zod"

const DEBUG = false

export const getSurvey = async (req: NextApiRequest, res: NextApiResponse) => {
  await api(() => null)

  const err = (status: number, message: string) => {
    res.status(status).json({ error: true, status: status, message })
    res.end()
  }

  let survey: ReturnType<typeof dbGetSurvey>
  try {
    const session = await getSession(req, res)
    // @ts-ignore
    survey = await dbGetSurvey(
      // @ts-ignore
      { projectSlug: req.query.projectSlug, id: Number(req.query.surveyId) },
      { session },
    )
  } catch (e) {
    if (e instanceof AuthorizationError) {
      err(403, "Forbidden")
    }
    // @ts-expect-error
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
