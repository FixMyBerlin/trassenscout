import { resolver } from "@blitzjs/rpc"
import db from "db"

import { ContactSchema } from "../schema"
import getProjectId from "../../projects/queries/getProjectId"
import { authorizeProjectAdmin } from "src/authorization"

export default resolver.pipe(resolver.zod(ContactSchema), authorizeProjectAdmin, async (input) => {
  return await db.contact.create({
    data: {
      projectId: (await getProjectId(input.projectSlug))!,
      ...input,
    },
  })
})
