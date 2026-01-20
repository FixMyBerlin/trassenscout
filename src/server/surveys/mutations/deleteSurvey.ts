import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

export const DeleteSurveySchema = z.object({ id: z.number() })

export default resolver.pipe(
  resolver.zod(DeleteSurveySchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    return await db.survey.deleteMany({ where: { id } })
  },
)
