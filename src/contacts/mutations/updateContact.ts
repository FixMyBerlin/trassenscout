import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { ContactSchema } from "../schema"

const UpdateContactSchemaSchema = ContactSchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateContactSchemaSchema),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const contact = await db.contact.update({ where: { id }, data })

    return contact
  }
)
