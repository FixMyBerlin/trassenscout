import db from "@/db"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
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

    const userLocationQuestionId = getQuestionIdBySurveySlug(surveySlug, "location")
    const geoCategoryId = getQuestionIdBySurveySlug(surveySlug, "geometryCategory")

    const filteredSurveyResponses = surveyResponses
      .filter(
        (response) =>
          //@ts-expect-error
          JSON.parse(response.data)[userLocationQuestionId] ||
          //@ts-expect-error
          JSON.parse(response.data)[geoCategoryId],
      )
      .sort((a, b) => b.id - a.id)

    const surveyResponse = filteredSurveyResponses[0]

    return {
      surveyResponse,
    }
  },
)
