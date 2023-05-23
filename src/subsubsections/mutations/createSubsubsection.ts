import { resolver } from "@blitzjs/rpc"
import db from "db"

import { authorizeProjectAdmin } from "src/authorization"
import { SubsubsectionSchema } from "../schema"
import getSubsectionProjectId from "src/subsections/queries/getSubsectionProjectId"

export default resolver.pipe(
  resolver.zod(SubsubsectionSchema),
  authorizeProjectAdmin(getSubsectionProjectId),
  async (input) => await db.subsubsection.create({ data: input })
)
