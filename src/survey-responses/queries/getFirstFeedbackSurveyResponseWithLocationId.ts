import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { getResponseConfigBySurveySlug } from "src/survey-public/utils/getConfigBySurveySlug"

type GetSurveySessionsWithResponsesInput = { projectSlug: string; surveyId: number }

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
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
    if (!surveyResponses?.length) throw new NotFoundError()

    const { evaluationRefs } = getResponseConfigBySurveySlug(
      surveyResponses[0]!.surveySession.survey.slug,
    )

    const filteredSurveyResponses = surveyResponses
      //@ts-expect-error
      .filter((response) => JSON.parse(response.data)[23])
      .sort((a, b) => b.id - a.id)

    const surveyResponse = filteredSurveyResponses[0]

    return {
      surveyResponse,
    }
  },
)
