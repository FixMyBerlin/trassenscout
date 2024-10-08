import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const GetSurveySession = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(GetSurveySession),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    return await db.surveySession.findFirstOrThrow({
      include: {
        responses: true,
      },
      where: { id },
    })
  },
)
