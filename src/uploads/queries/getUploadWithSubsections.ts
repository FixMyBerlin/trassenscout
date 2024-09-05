import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getUploadProjectId from "./getUploadProjectId"
import { viewerRoles } from "../../authorization/constants"

const UploadSchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(UploadSchema),
  authorizeProjectAdmin(getUploadProjectId, viewerRoles),
  async ({ id }) => {
    return await db.upload.findFirstOrThrow({
      where: { id },
      include: { subsection: { select: { id: true, slug: true, start: true, end: true } } },
    })
  },
)
