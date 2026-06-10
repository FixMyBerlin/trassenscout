import db from "@/src/server/db.server"

const OHV_VORGANGS_ID_PREFIX = "547010"
const REFERENCE_ID_PATTERN = new RegExp(`^${OHV_VORGANGS_ID_PREFIX}_(\\d+)$`)

const parseOhvReferenceIdRunningNumber = (data: string) => {
  const parsedData = JSON.parse(data) as { referenceId?: unknown }

  if (typeof parsedData.referenceId === "string") {
    const formattedMatch = parsedData.referenceId.match(REFERENCE_ID_PATTERN)
    if (formattedMatch) return Number(formattedMatch[1])
  }

  return null
}

export const createNextOhvReferenceId = async (
  surveyId: number,
  client: Pick<typeof db, "surveyResponse"> = db,
) => {
  const existingPart2Responses = await client.surveyResponse.findMany({
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
    const runningNumber = parseOhvReferenceIdRunningNumber(response.data)
    return runningNumber && runningNumber > highest ? runningNumber : highest
  }, 0)

  return `${OHV_VORGANGS_ID_PREFIX}_${highestRunningNumber + 1}`
}
