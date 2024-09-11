import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"
import getSurveyProjectId from "./getSurveyProjectId"

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
