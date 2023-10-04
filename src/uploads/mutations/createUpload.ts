import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { UploadSchema } from "../schema"

const CreateUploadSchema = UploadSchema.merge(
  z.object({
    projectSlug: z.string(),
  }),
)

export default resolver.pipe(
  resolver.zod(CreateUploadSchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, ...input }) =>
    await db.upload.create({
      data: {
        projectId: await getProjectIdBySlug(projectSlug),
        ...input,
      },
    }),
)
