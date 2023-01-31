import { resolver } from "@blitzjs/rpc"
import db from "db"
import { ContactSchema } from "../schema"

export default resolver.pipe(resolver.zod(ContactSchema), resolver.authorize(), async (input) => {
  const contact = await db.contact.create({ data: input })

  return contact
})
