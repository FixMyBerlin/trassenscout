import { Ctx } from "blitz"
import db from "db"
import { CurrentUser } from "../types"

export default async function getCurrentUser(_ = null, { session }: Ctx) {
  if (!session.userId) return null

  const user = await db.user.findFirst({
    where: { id: session.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      projects: true, // projects of which user is coordinator
      Membership: {
        select: {
          project: { select: { slug: true, shortTitle: true } },
        },
      },
    },
  })

  // TODO: Change `as` to `satisfies` once TS 4.9 is available
  return user as CurrentUser | null
}
