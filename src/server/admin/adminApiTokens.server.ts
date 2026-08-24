import { createHash, randomBytes } from "node:crypto"
import { UserRoleEnum } from "@/src/prisma/generated/client"
import { ADMIN_API_TOKEN_PREFIX } from "@/src/server/admin/adminApiTokenPrefix.const"
import db from "@/src/server/db.server"

const LAST_USED_UPDATE_INTERVAL_MS = 5 * 60 * 1000

function generateToken() {
  return `${ADMIN_API_TOKEN_PREFIX}${randomBytes(32).toString("hex")}`
}

export function hashAdminApiToken(plaintext: string) {
  return createHash("sha256").update(plaintext).digest("hex")
}

export async function createAdminApiToken(input: { name: string; createdById: number }) {
  const token = generateToken()
  const row = await db.adminApiToken.create({
    data: {
      name: input.name,
      hashedToken: hashAdminApiToken(token),
      createdById: input.createdById,
    },
  })
  return { token, row }
}

export async function listAdminApiTokens() {
  return db.adminApiToken.findMany({
    orderBy: [{ revokedAt: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastUsedAt: true,
      revokedAt: true,
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  })
}

export async function revokeAdminApiToken(id: string) {
  return db.adminApiToken.update({
    where: { id },
    data: { revokedAt: new Date() },
    select: { id: true },
  })
}

export async function verifyAdminApiToken(plaintext: string) {
  if (!plaintext.startsWith(ADMIN_API_TOKEN_PREFIX)) return null

  const row = await db.adminApiToken.findUnique({
    where: { hashedToken: hashAdminApiToken(plaintext) },
    select: {
      id: true,
      createdById: true,
      revokedAt: true,
      lastUsedAt: true,
      createdBy: { select: { role: true } },
    },
  })
  if (!row || row.revokedAt || row.createdBy.role !== UserRoleEnum.ADMIN) return null

  const shouldTouchLastUsed =
    row.lastUsedAt == null || Date.now() - row.lastUsedAt.getTime() >= LAST_USED_UPDATE_INTERVAL_MS
  if (shouldTouchLastUsed) {
    await db.adminApiToken.update({ where: { id: row.id }, data: { lastUsedAt: new Date() } })
  }

  return { tokenId: row.id, createdById: row.createdById }
}
