import db, { SurveyResponseStateEnum } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { resolver } from "@blitzjs/rpc"
import { viewerRoles } from "../../../authorization/constants"
import { extractProjectSlug } from "../../../authorization/extractProjectSlug"

type GetSurveySurveyResponsesBySurveySessionIdInput = {
  projectSlug: string
  surveySessionId: number
}

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ surveySessionId, projectSlug }: GetSurveySurveyResponsesBySurveySessionIdInput) => {
    const surveyResponse = await db.surveyResponse.findFirst({
      where: {
        state: SurveyResponseStateEnum.SUBMITTED,
        surveySession: {
          survey: { project: { slug: projectSlug } },
          id: surveySessionId,
        },
        surveyPart: 1,
      },
    })
    // This query is used to get the survey response (first part, "Umfrage-Teil") by surveySessionId from a surveyresponses (second part, "Hinweis-Teil").
    // There are surveySessionIds that are not connected to a first part surveyresponse ("Umfrage-Teil").
    // In reality / production, this should not happen (Every user starts with the first part), but it does happen locally and on staging (e.g. when we skip teh first part of the survey and start with "FEEDBACK")
    // We do not want the app to break in this case.
    if (!surveyResponse) return null

    const parseddata = JSON.parse(surveyResponse.data)
    const parsedSurveyResponse = { ...surveyResponse, data: parseddata }

    return parsedSurveyResponse
  },
)
