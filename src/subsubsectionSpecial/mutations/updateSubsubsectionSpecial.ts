import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getQualityLevelProjectId from "../queries/getSubsubsectionSpecialProjectId"
import { SubsubsectionSpecial } from "../schema"

const UpdateSubsubsectionSpecialSchema = SubsubsectionSpecial.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionSpecialSchema),
  authorizeProjectAdmin(getQualityLevelProjectId),
  async ({ id, ...data }) =>
    await db.subsubsectionSpecial.update({
      where: { id },
      data,
    }),
)
