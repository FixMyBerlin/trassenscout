import db from "@/db"
import {
  AllowedSurveySlugs,
  isSurveyLegacy,
  SurveyLegacySlugs,
} from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getResponseConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"

type GetSurveySessionsWithResponsesInput = { projectSlug: string; surveyId: number }

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, surveyId }: GetSurveySessionsWithResponsesInput) => {
    const surveyResponses = await db.surveyResponse.findMany({
      where: {
        // Only surveyResponse.session.project === projectSlug
        surveySession: {
          survey: { project: { slug: projectSlug } },
          // Only surveyResponse.surveyId === surveyId
          surveyId,
        },
        surveyPart: 2,
      },
      include: {
        surveySession: { include: { survey: { select: { slug: true } } } },
      },
    })
    if (!surveyResponses?.length)
      return {
        surveyResponse: null,
      }

    const surveySlug = surveyResponses[0]!.surveySession.survey.slug as AllowedSurveySlugs

    const isLegacy = isSurveyLegacy(surveySlug)

    const userLocationQuestionId = isLegacy
      ? getResponseConfigBySurveySlug(surveySlug as SurveyLegacySlugs)?.evaluationRefs["location"]
      : "location"

    const filteredSurveyResponses = surveyResponses
      //@ts-expect-error
      .filter((response) => JSON.parse(response.data)[userLocationQuestionId])
      .sort((a, b) => b.id - a.id)

    const surveyResponse = filteredSurveyResponses[0]

    return {
      surveyResponse,
    }
  },
)
