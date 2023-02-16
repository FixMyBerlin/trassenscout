import { resolver } from "@blitzjs/rpc"
import db from "db"
import { FileSchema } from "../schema"
import getProjectId from "../../projects/queries/getProjectId"

export default resolver.pipe(resolver.zod(FileSchema), resolver.authorize(), async (input) => {
  return await db.file.create({
    data: {
      projectId: (await getProjectId(input.projectSlug))!,
      ...input,
    },
  })
})
