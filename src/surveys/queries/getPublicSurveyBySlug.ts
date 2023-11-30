import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetSurvey = z.object({
  slug: z.string(),
})

export default resolver.pipe(resolver.zod(GetSurvey), async ({ slug }) => {
  const survey = await db.survey.findFirst({
    where: { slug },
    // For the public query, only return public information
    select: { slug: true, id: true, active: true },
  })
  if (!survey) throw new NotFoundError()
  return survey
})
