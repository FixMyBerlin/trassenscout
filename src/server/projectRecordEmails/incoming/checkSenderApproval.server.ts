import { z } from "zod"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"

function extractEmailAddress(emailString: string) {
  let emailAddress = emailString.trim()
  const emailMatch = emailString.match(/<([^<>]+)>\s*$/)
  if (emailMatch?.[1]) {
    emailAddress = emailMatch[1].trim()
  }

  const result = z.email().safeParse(emailAddress)
  return result.success ? result.data : null
}

export async function findAdminOrProjectMember({
  projectId,
  email,
}: {
  projectId: number
  email: string | null
}) {
  const emailAddress = email ? extractEmailAddress(email) : null
  if (!emailAddress) return null

  return db.user.findFirst({
    where: {
      email: emailAddress.toLowerCase(),
      OR: [{ role: UserRoleEnum.ADMIN }, { memberships: { some: { projectId } } }],
    },
    select: { id: true, email: true },
  })
}

export async function isAdminOrProjectMember(input: { projectId: number; email: string | null }) {
  return Boolean(await findAdminOrProjectMember(input))
}
