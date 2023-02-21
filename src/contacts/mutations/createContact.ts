import { resolver } from "@blitzjs/rpc"
import db from "db"

import { ContactSchema } from "../schema"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { authorizeProjectAdmin } from "src/authorization"

export default resolver.pipe(resolver.zod(ContactSchema), authorizeProjectAdmin(), async (input) => {
  return await db.contact.create({
    data: {
      projectId: (await getProjectIdBySlug(input.projectSlug))!,
      ...input,
    },
  })
})
