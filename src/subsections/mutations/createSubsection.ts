import { resolver } from "@blitzjs/rpc"
import db from "db"

import { authorizeProjectAdmin } from "src/authorization"
import { SubsectionSchema } from "../schema"
import getSectionProjectId from "../../sections/queries/getSectionProjectId"

export default resolver.pipe(
  resolver.zod(SubsectionSchema),
  authorizeProjectAdmin(getSectionProjectId),
  async (input) => await db.subsection.create({ data: input })
)
