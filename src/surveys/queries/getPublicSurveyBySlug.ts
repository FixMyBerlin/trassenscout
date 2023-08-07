import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetSurvey = z.object({
  slug: z.string(),
})

export default resolver.pipe(
  resolver.zod(GetSurvey),
  async ({ slug }) =>
    await db.survey.findFirstOrThrow({
      where: { slug },
      // For the public query, only return public information
      select: { slug: true, active: true },
    }),
)
