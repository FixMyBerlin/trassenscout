import { resolver } from "@blitzjs/rpc"
import db from "db"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

type GetSurveySessionsWithResponsesInput = { projectSlug: string; surveyId: number }

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, surveyId }: GetSurveySessionsWithResponsesInput) => {
    const surveyResponse = await db.surveyResponse.findFirst({
      where: {
        // Only surveyResponse.session.project === projectSlug
        surveySession: {
          survey: { project: { slug: projectSlug } },
          // Only surveyResponse.surveyId === surveyId
          surveyId,
        },
        surveyPart: 2,
      },
      select: {
        id: true,
      },
    })

    return {
      surveyResponse,
    }
  },
)
