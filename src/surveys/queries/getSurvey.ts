import db from "@/db"
import {
  allowedSurveySlugs,
  AllowedSurveySlugsSchema,
} from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"

const GetSurveySchema = ProjectSlugRequiredSchema.merge(
  z.object({
    // This accepts type of undefined, but is required at runtime
    id: z.number().optional().refine(Boolean, "Required"),
  }),
)

export default resolver.pipe(
  resolver.zod(GetSurveySchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ id }) => {
    const survey = await db.survey.findFirstOrThrow({
      where: { id },
      include: { project: true },
    })
    if (!allowedSurveySlugs.includes(survey.slug)) {
      throw new NotFoundError()
    }
    const zod = AllowedSurveySlugsSchema.parse(survey)
    return { ...survey, slug: zod.slug }
  },
)
