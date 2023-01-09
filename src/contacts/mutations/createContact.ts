import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { ContactSchema } from "../schema"

export default resolver.pipe(resolver.zod(ContactSchema), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const contact = await db.contact.create({ data: input })

  return contact
})
