import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateSurveySession = z.object({
  id: z.number(),
  email: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateSurveySession),
  async ({ id, ...data }) =>
    await db.surveySession.update({
      where: { id },
      data,
    })
)
