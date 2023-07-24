import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { FileSchema } from "../schema"
import { authorizeProjectAdmin } from "src/authorization"
import db from "db"

const CreateFileSchema = FileSchema.merge(
  z.object({
    projectSlug: z.string(),
  }),
)

export default resolver.pipe(
  resolver.zod(CreateFileSchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, ...input }) =>
    await db.file.create({
      data: {
        projectId: await getProjectIdBySlug(projectSlug),
        ...input,
      },
    }),
)
