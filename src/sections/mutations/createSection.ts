import { resolver } from "@blitzjs/rpc"
import db from "db"
import { SectionSchema } from "../schema"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"

export default resolver.pipe(resolver.zod(SectionSchema), resolver.authorize(), async (input) => {
  return await db.section.create({
    data: {
      projectId: (await getProjectIdBySlug(input.projectSlug))!,
      ...input,
    },
  })
})
