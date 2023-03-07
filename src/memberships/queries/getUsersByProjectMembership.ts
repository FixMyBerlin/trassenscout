import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetProject = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetProject), resolver.authorize(), async ({ id }) => {
  const membershipUsers = await db.membership.findMany({
    where: { projectId: id },
    select: { user: { select: { email: true, phone: true, firstName: true, lastName: true } } },
  })

  const users = membershipUsers.map((user) => user.user)

  if (!users.length) throw new NotFoundError()

  return users
})
