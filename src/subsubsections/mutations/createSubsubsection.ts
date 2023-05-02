import { resolver } from "@blitzjs/rpc"
import db from "db"

import { authorizeProjectAdmin } from "src/authorization"
import { SubsubsectionSchema } from "../schema"
import getSectionProjectId from "../../sections/queries/getSectionProjectId"

export default resolver.pipe(
  resolver.zod(SubsubsectionSchema),
  authorizeProjectAdmin(getSectionProjectId),
  async (input) => await db.subsubsection.create({ data: input })
)
