import db from "../../db"

export async function getMemberships(userId: number) {
  const user = await db.user.findFirst({
    where: { id: userId },
    select: {
      memberships: {
        select: {
          role: true,
          project: {
            select: {
              id: true,
              slug: true,
            },
          },
        },
      },
    },
  })
  if (user === null) throw new Error("Will never happen.") // make ts happy
  const { memberships } = user
  return { memberships }
}
