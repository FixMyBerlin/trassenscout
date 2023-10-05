import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getUploadProjectId from "../queries/getUploadProjectId"
import { UploadSchema } from "../schema"

const UpdateUploadSchema = UploadSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateUploadSchema),
  authorizeProjectAdmin(getUploadProjectId),
  async ({ id, ...data }) =>
    await db.upload.update({
      where: { id },
      data,
      include: { subsection: { select: { id: true, slug: true, start: true, end: true } } },
    }),
)
