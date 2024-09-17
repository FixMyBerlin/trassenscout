import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getQualityLevelProjectId from "../queries/getSubsubsectionInfraProjectId"
import { SubsubsectionInfra } from "../schema"

const UpdateSubsubsectionInfraSchema = SubsubsectionInfra.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionInfraSchema),
  authorizeProjectAdmin(getQualityLevelProjectId),
  async ({ id, ...data }) =>
    await db.subsubsectionInfra.update({
      where: { id },
      data,
    }),
)
