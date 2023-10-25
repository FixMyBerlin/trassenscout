import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getQualityLevelProjectId from "../queries/getSubsubsectionStatusProjectId"
import { SubsubsectionStatus } from "../schema"

const UpdateSubsubsectionStatusSchema = SubsubsectionStatus.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionStatusSchema),
  authorizeProjectAdmin(getQualityLevelProjectId),
  async ({ id, ...data }) =>
    await db.subsubsectionStatus.update({
      where: { id },
      data,
    }),
)
