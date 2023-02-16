import { resolver } from "@blitzjs/rpc"
import db from "db"
import { ContactSchema } from "../schema"
import getProjectId from "../../projects/queries/getProjectId"

export default resolver.pipe(resolver.zod(ContactSchema), resolver.authorize(), async (input) => {
  return await db.contact.create({
    data: {
      projectId: (await getProjectId(input.projectSlug))!,
      ...input,
    },
  })
})
