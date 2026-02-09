import db, { SurveyResponseStateEnum } from "@/db"
import { AllowedSurveySlugsSchema } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { resolver } from "@blitzjs/rpc"

export default resolver.pipe(
  resolver.zod(AllowedSurveySlugsSchema),
  resolver.authorize("ADMIN"),
  async ({ slug }) => {
    return await db.surveyResponse.findMany({
      where: {
        state: SurveyResponseStateEnum.CREATED,
        surveySession: { survey: { slug } },
      },
      include: {
        surveySession: true,
      },
      orderBy: { id: "desc" },
    })
  },
)
