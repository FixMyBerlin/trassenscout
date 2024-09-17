import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getQualityLevelProjectId from "../queries/getQualityLevelProjectId"
import { QualityLevelSchema } from "../schema"

const UpdateQualityLevelSchema = QualityLevelSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateQualityLevelSchema),
  authorizeProjectAdmin(getQualityLevelProjectId),
  async ({ id, ...data }) =>
    await db.qualityLevel.update({
      where: { id },
      data,
    }),
)
