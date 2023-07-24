import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getStakeholdernoteProjectId from "./getStakeholdernoteProjectId"
import db from "db"

import { authorizeProjectAdmin } from "src/authorization"

const GetStakeholdernoteSchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetStakeholdernoteSchema),
  authorizeProjectAdmin(getStakeholdernoteProjectId),
  async ({ id }) =>
    await db.stakeholdernote.findFirstOrThrow({
      where: { id },
    }),
)
