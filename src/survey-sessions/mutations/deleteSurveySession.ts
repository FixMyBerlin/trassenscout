import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteSurveySession = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSurveySession),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const surveySession = await db.surveySession.deleteMany({ where: { id } })

    return surveySession
  }
)
