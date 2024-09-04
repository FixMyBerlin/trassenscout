import { Ctx } from "blitz"
import db from "db"

export default async function getCurrentUserWithMemberships(_ = null, { session }: Ctx) {
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
      institution: true,
      memberships: {
        select: {
          role: true,
          project: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  })

  return user
}
