import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetSurveySchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetSurveySchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => await db.survey.findFirstOrThrow({ where: { id } }),
)
