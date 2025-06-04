import db from "@/db"
import { allowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"

import { resolver } from "@blitzjs/rpc"

import { z } from "zod"

const GetSurveySchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

const CombinedSurveySchema = z
  .object({
    slug: z.enum([...allowedSurveySlugs] as const),
  })
  .passthrough()

export default resolver.pipe(
  resolver.zod(GetSurveySchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const survey = await db.survey.findFirstOrThrow({
      where: { id },
    })

    const validatedSurvey = CombinedSurveySchema.parse(survey)
    return { ...survey, slug: validatedSurvey.slug }
  },
)
