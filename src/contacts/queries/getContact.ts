import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"

import { z } from "zod"
import { authorizeProjectAdmin } from "src/authorization"

const GetContact = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
  projectSlug: z.string(),
})

export default resolver.pipe(resolver.zod(GetContact), authorizeProjectAdmin, async ({ id }) => {
  const contact = await db.contact.findFirst({ where: { id } })
  if (!contact) throw new NotFoundError()

  return contact
})
