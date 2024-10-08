import db from "@/db"
import { AllowedSurveySlugsSchema } from "@/src/survey-public/utils/allowedSurveySlugs"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const GetSurveySchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetSurveySchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const survey = await db.survey.findFirstOrThrow({
      where: { id },
    })
    const zod = AllowedSurveySlugsSchema.parse(survey)
    return { ...survey, slug: zod.slug }
  },
)
