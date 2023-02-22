import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { SectionSchema } from "../schema"

const CreateSectionSchema = SectionSchema.merge(
  z.object({
    projectSlug: z.string(),
  })
)

export default resolver.pipe(
  resolver.zod(CreateSectionSchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, ...input }) =>
    await db.section.create({
      data: {
        projectId: await getProjectIdBySlug(projectSlug),
        ...input,
      },
    })
)
