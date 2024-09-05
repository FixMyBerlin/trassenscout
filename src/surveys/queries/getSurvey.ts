import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getSurveyProjectId from "./getSurveyProjectId"
import { viewerRoles } from "../../authorization/constants"

const GetSurveySchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetSurveySchema),
  authorizeProjectAdmin(getSurveyProjectId, viewerRoles),
  async ({ id }) =>
    await db.survey.findFirstOrThrow({
      where: { id },
    }),
)
