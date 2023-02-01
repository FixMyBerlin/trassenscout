import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteContact = z.object({
  id: z.number(),
})

export default resolver.pipe(resolver.zod(DeleteContact), resolver.authorize(), async ({ id }) => {
  const contact = await db.contact.deleteMany({ where: { id } })

  return contact
})
