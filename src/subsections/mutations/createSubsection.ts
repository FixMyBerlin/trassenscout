import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getSectionProjectId from "../../sections/queries/getSectionProjectId"
import { SubsectionSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(SubsectionSchema),
  authorizeProjectAdmin(getSectionProjectId),
  async (input) => {
    const subsection = await db.subsection.create({
      data: input,
    })
    return subsection
  }
)
