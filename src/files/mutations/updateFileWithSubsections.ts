import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import getFileProjectId from "../queries/getFileProjectId"
import { FileSchema } from "../schema"
import { authorizeProjectAdmin } from "src/authorization"
import db from "db"

const UpdateFileSchema = FileSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateFileSchema),
  authorizeProjectAdmin(getFileProjectId),
  async ({ id, ...data }) =>
    await db.file.update({
      where: { id },
      data,
      include: { subsection: { select: { id: true, slug: true, start: true, end: true } } },
    }),
)
