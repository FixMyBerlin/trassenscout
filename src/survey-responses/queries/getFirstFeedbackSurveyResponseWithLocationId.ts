import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { getResponseConfigBySurveySlug } from "src/survey-public/utils/getConfigBySurveySlug"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetSurveySessionsWithResponsesInput = { projectSlug: string; surveyId: number }

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(extractProjectSlug, viewerRoles),
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

    const surveySlug = surveyResponses[0]!.surveySession.survey.slug

    const { evaluationRefs } = getResponseConfigBySurveySlug(surveySlug)

    const filteredSurveyResponses = surveyResponses
      //@ts-expect-error
      .filter((response) => JSON.parse(response.data)[evaluationRefs["feedback-location"]])
      .sort((a, b) => b.id - a.id)

    const surveyResponse = filteredSurveyResponses[0]

    return {
      surveyResponse,
    }
  },
)
