import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getQualityLevelProjectId from "../queries/getQualityLevelProjectId"

const DeleteQualityLevelSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteQualityLevelSchema),
  authorizeProjectAdmin(getQualityLevelProjectId),
  async ({ id }) => await db.qualityLevel.deleteMany({ where: { id } }),
)
