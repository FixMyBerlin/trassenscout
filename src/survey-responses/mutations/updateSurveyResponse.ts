import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateSurveyResponse = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateSurveyResponse),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const surveyResponse = await db.surveyResponse.update({
      where: { id },
      data,
    })

    return surveyResponse
  }
)
