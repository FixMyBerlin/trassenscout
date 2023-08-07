import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getSubsectionProjectId from "src/subsections/queries/getSubsectionProjectId"
import { StakeholdernoteSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(StakeholdernoteSchema),
  authorizeProjectAdmin(getSubsectionProjectId),
  async (input) => await db.stakeholdernote.create({ data: input }),
)
