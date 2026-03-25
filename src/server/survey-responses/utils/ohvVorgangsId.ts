import db from "@/db"
import { OHV_VORGANGS_ID_PREFIX } from "@/src/app/beteiligung/_ohv-haltestellenfoerderung/config"

const VORGANGS_ID_PATTERN = new RegExp(`^${OHV_VORGANGS_ID_PREFIX}_(\\d{3})$`)

export const parseOhvRunningNumber = (data: string): number | null => {
  const parsedData = JSON.parse(data) as { vorgangsId?: unknown }

  if (typeof parsedData.vorgangsId === "string") {
    const formattedMatch = parsedData.vorgangsId.match(VORGANGS_ID_PATTERN)
    if (formattedMatch) return Number(formattedMatch[1])
  }

  return null
}

export const createNextOhvVorgangsId = async (surveyId: number) => {
  const existingPart2Responses = await db.surveyResponse.findMany({
    where: {
      surveyPart: 2,
      surveySession: {
        surveyId,
      },
    },
    select: {
      data: true,
    },
  })

  const highestRunningNumber = existingPart2Responses.reduce((highest, response) => {
    const runningNumber = parseOhvRunningNumber(response.data)
    return runningNumber && runningNumber > highest ? runningNumber : highest
  }, 0)

  return `${OHV_VORGANGS_ID_PREFIX}_${String(highestRunningNumber + 1).padStart(3, "0")}`
}
