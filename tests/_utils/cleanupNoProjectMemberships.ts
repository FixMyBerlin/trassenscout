import { seedUsers } from "@/tests/_fixtures/auth"
import { getTestDb } from "@/tests/_utils/testDb"

export async function cleanupNoProjectMemberships() {
  const db = await getTestDb()
  await db.membership.deleteMany({ where: { user: { email: seedUsers.noProject } } })
}
