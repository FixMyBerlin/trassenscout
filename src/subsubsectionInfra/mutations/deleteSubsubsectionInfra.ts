import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getSubsubsectionInfraProjectId from "../queries/getSubsubsectionInfraProjectId"

const DeleteSubsubsectionInfraSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSubsubsectionInfraSchema),
  authorizeProjectAdmin(getSubsubsectionInfraProjectId),
  async ({ id }) => await db.subsubsectionInfra.deleteMany({ where: { id } }),
)
