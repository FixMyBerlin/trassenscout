import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { FileSchema } from "../schema"

const CreateFileSchema = FileSchema.merge(
  z.object({
    projectSlug: z.string(),
  })
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
    })
)
