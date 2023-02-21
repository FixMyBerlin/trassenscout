import { resolver } from "@blitzjs/rpc"
import db from "db"

import { z } from "zod"
import { ContactSchema } from "../schema"
import { authorizeProjectAdmin } from "src/authorization"

const UpdateContactSchemaSchema = ContactSchema.merge(
  z.object({
    id: z.number(),
    projectSlug: z.string(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateContactSchemaSchema),
  authorizeProjectAdmin(),
  async ({ id, ...data }) => {
    return await db.contact.update({ where: { id }, data })
  }
)
