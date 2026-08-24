import { hashAdminApiToken } from "@/src/server/admin/adminApiTokens.server"
import db from "@/src/server/db.server"
import { LOCAL_DEV_ADMIN_API_TOKEN, LOCAL_DEV_ADMIN_API_TOKEN_NAME } from "./adminApiToken.const"

const seedAdminApiToken = async () => {
  const adminUser = await db.user.findFirstOrThrow({
    where: { email: "admin@fixmycity.test" },
    select: { id: true },
  })

  const hashedToken = hashAdminApiToken(LOCAL_DEV_ADMIN_API_TOKEN)
  await db.adminApiToken.upsert({
    where: { hashedToken },
    create: {
      name: LOCAL_DEV_ADMIN_API_TOKEN_NAME,
      hashedToken,
      createdById: adminUser.id,
    },
    update: {
      name: LOCAL_DEV_ADMIN_API_TOKEN_NAME,
      createdById: adminUser.id,
      revokedAt: null,
      lastUsedAt: null,
    },
  })
}

export default seedAdminApiToken
