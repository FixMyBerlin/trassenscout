import { resolver } from "@blitzjs/rpc"
import { StakeholdernoteSchema } from "../schema"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getSubsectionProjectId from "src/subsections/queries/getSubsectionProjectId"

export default resolver.pipe(
  resolver.zod(StakeholdernoteSchema),
  authorizeProjectAdmin(getSubsectionProjectId),
  async (input) => await db.stakeholdernote.create({ data: input }),
)
