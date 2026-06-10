import db from "@/src/server/db.server"

export async function membershipUpdateSession(userId: number) {
  await db.authSession.deleteMany({ where: { userId } })
  await db.session.deleteMany({ where: { userId } })
}
