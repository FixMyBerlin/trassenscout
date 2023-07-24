import { resolver } from "@blitzjs/rpc"
import getSubsectionProjectId from "../queries/getSubsectionProjectId"
import { SubsectionSchema } from "../schema"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"

export default resolver.pipe(
  resolver.zod(SubsectionSchema),
  authorizeProjectAdmin(getSubsectionProjectId),
  async (input) => {
    const subsection = await db.subsection.create({
      data: input,
    })
    return subsection
  },
)
