import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getFileProjectId from "./getFileProjectId"
import db from "db"

import { authorizeProjectAdmin } from "src/authorization"

const GetFileSchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetFileSchema),
  authorizeProjectAdmin(getFileProjectId),
  async ({ id }) => {
    return await db.file.findFirstOrThrow({
      where: { id },
      include: { subsection: { select: { id: true, slug: true, start: true, end: true } } },
    })
  },
)
