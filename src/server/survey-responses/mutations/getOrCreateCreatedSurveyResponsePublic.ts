import db from "@/db"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { resolver } from "@blitzjs/rpc"
import { SurveyResponseSourceEnum, SurveyResponseStateEnum } from "@prisma/client"
import { z } from "zod"

const GetOrCreateCreatedSurveyResponsePublicSchema = z.object({
  surveySessionId: z.number().int().positive(),
  surveyPart: z.number().int().positive(),
  data: z.string(),
  source: z.nativeEnum(SurveyResponseSourceEnum),
  status: z.string().optional(),
})

const parseRunningNumber = ({
  data,
  prefix,
}: {
  data: string
  prefix: string
}): number | null => {
  const parsedData = JSON.parse(data) as { vorgangsId?: unknown; subsubsectionId?: unknown }

  if (typeof parsedData.vorgangsId === "string") {
    const formattedMatch = parsedData.vorgangsId.match(new RegExp(`^${prefix}_(\\d{3})$`))
    if (formattedMatch) return Number(formattedMatch[1])
  }

  const historicalValue = parsedData.subsubsectionId
  if (typeof historicalValue === "string" && /^\d{1,3}$/.test(historicalValue)) {
    return Number(historicalValue)
  }

  return null
}

/**
 * Returns the existing CREATED SurveyResponse for the given session+part,
 * or creates one if none exists.
 *
 * This makes "start part" idempotent and prevents duplicate CREATED responses
 * when users switch back and forth between intro and form.
 */
export default resolver.pipe(
  resolver.zod(GetOrCreateCreatedSurveyResponsePublicSchema),
  async (input) => {
    const existing = await db.surveyResponse.findFirst({
      where: {
        surveySessionId: input.surveySessionId,
        surveyPart: input.surveyPart,
        state: SurveyResponseStateEnum.CREATED,
      },
      select: {
        id: true,
        data: true,
      },
    })

    if (existing) return existing

    const surveySession = await db.surveySession.findUniqueOrThrow({
      where: { id: input.surveySessionId },
      select: {
        surveyId: true,
        survey: {
          select: {
            slug: true,
          },
        },
      },
    })

    const surveySlug = surveySession.survey.slug as AllowedSurveySlugs
    const surveyBackendConfig = getConfigBySurveySlug(surveySlug, "backend")
    const shouldGenerateVorgangsId =
      surveySlug === "ohv-haltestellenfoerderung" &&
      input.surveyPart === 2 &&
      Boolean(surveyBackendConfig.vorgangsIdPrefix)

    let initialData = input.data

    if (shouldGenerateVorgangsId) {
      const existingPart2Responses = await db.surveyResponse.findMany({
        where: {
          surveyPart: 2,
          surveySession: {
            surveyId: surveySession.surveyId,
          },
        },
        select: {
          data: true,
        },
      })

      const highestRunningNumber = existingPart2Responses.reduce((highest, response) => {
        const runningNumber = parseRunningNumber({
          data: response.data,
          prefix: surveyBackendConfig.vorgangsIdPrefix!,
        })

        return runningNumber && runningNumber > highest ? runningNumber : highest
      }, 0)

      const vorgangsId = `${surveyBackendConfig.vorgangsIdPrefix}_${String(
        highestRunningNumber + 1,
      ).padStart(3, "0")}`

      initialData = JSON.stringify({
        ...(JSON.parse(input.data) as Record<string, unknown>),
        vorgangsId,
      })
    }

    return await db.surveyResponse.create({
      data: {
        surveySessionId: input.surveySessionId,
        surveyPart: input.surveyPart,
        data: initialData,
        source: input.source,
        status: input.status,
        state: SurveyResponseStateEnum.CREATED,
      },
      select: {
        id: true,
        data: true,
      },
    })
  },
)
