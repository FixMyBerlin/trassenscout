import { z } from "zod"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"

function extractEmailAddress(emailString: string) {
  let emailAddress = emailString.trim()
  const emailMatch = emailString.match(/<(.+?)>/)
  if (emailMatch?.[1]) {
    emailAddress = emailMatch[1].trim()
  }

  const result = z.email().safeParse(emailAddress)
  return result.success ? result.data : null
}

export async function isAdminOrProjectMember({
  projectId,
  email,
}: {
  projectId: number
  email: string | null
}) {
  if (!email) {
    return false
  }

  const emailAddress = extractEmailAddress(email)
  if (!emailAddress) {
    return false
  }

  const normalizedEmail = emailAddress.toLowerCase()

  const adminUser = await db.user.findFirst({
    where: {
      email: normalizedEmail,
      role: UserRoleEnum.ADMIN,
    },
  })

  if (adminUser) {
    return true
  }

  const membership = await db.membership.findFirst({
    where: {
      projectId,
      user: {
        email: normalizedEmail,
      },
    },
  })

  return Boolean(membership)
}
