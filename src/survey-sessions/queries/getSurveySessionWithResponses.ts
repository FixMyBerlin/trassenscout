import { resolver } from "@blitzjs/rpc"
import db, { SurveyResponse, SurveySession } from "db"
import { z } from "zod"

const GetSurveySession = z.object({
  id: z.number(),
})

interface SurveySessionWithResponses extends SurveySession {
  responses: SurveyResponse[]
}

export default resolver.pipe(
  resolver.zod(GetSurveySession),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const surveySession = (await db.surveySession.findFirstOrThrow({
      include: {
        responses: true,
      },
      where: { id },
    })) as SurveySessionWithResponses
    return surveySession
  },
)
