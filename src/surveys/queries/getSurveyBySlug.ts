import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const GetSurvey = z.object({
  slug: z.string(),
})

export default resolver.pipe(
  resolver.zod(GetSurvey),
  async ({ slug }) => await db.survey.findFirstOrThrow({ where: { slug } }),
)
