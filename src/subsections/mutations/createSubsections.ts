import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getSubsectionProjectId from "../queries/getSubsectionProjectId"
import { SubsectionsSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(SubsectionsSchema),
  authorizeProjectAdmin(getSubsectionProjectId),
  async (data) => {
    const subsection = await db.subsection.createMany({
      data: data,
      // skipDuplicates: true, // ?
    })
    return subsection
  },
)
