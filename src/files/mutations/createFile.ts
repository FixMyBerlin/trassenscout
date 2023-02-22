import { resolver } from "@blitzjs/rpc"
import db from "db"

import { FileSchema } from "../schema"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { authorizeProjectAdmin } from "src/authorization"

export default resolver.pipe(resolver.zod(FileSchema), authorizeProjectAdmin, async (input) => {
  return await db.file.create({
    data: {
      projectId: (await getProjectIdBySlug(input.projectSlug))!,
      ...input,
    },
  })
})
