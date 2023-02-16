import { resolver } from "@blitzjs/rpc"
import db from "db"
import { SectionSchema } from "../schema"
import getProjectId from "../../projects/queries/getProjectId"

export default resolver.pipe(resolver.zod(SectionSchema), resolver.authorize(), async (input) => {
  return await db.section.create({
    data: {
      projectId: (await getProjectId(input.projectSlug))!,
      ...input,
    },
  })
})
