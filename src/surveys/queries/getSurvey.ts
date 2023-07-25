import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"

import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

const GetSurveySchema = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetSurveySchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ slug }) => await db.survey.findFirstOrThrow({ where: { slug } }),
)
