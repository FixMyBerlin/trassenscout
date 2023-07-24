import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const GetSurvey = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetSurvey),
  resolver.authorize("ADMIN"),
  async ({ id }) => await db.survey.findFirstOrThrow({ where: { id } }),
)
