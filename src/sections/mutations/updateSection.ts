import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getSectionProjectId from "../queries/getSectionProjectId"
import { SectionSchema } from "../schema"

const UpdateSectionSchema = SectionSchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateSectionSchema),
  authorizeProjectAdmin(getSectionProjectId),
  async ({ id, ...data }) => {
    const section = await db.section.update({
      where: { id },
      data,
    })
    return section
  }
)
