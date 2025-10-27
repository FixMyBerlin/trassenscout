import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteProjectRecordAdminSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteProjectRecordAdminSchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const projectRecord = await db.projectRecord.deleteMany({ where: { id } })
    // TODO: Add admin log entry if needed
    return projectRecord
  },
)
