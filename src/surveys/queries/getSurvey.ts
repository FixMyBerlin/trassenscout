import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"

import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

const GetSurveySchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetSurveySchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => await db.survey.findFirstOrThrow({ where: { id } }),
)
