import db from "db"
import { z } from "zod"

export const extractEmailAddress = (emailString: string) => {
  // Extract email address from format: "Display Name" <email@address.com>
  let emailAddress = emailString.trim()
  const emailMatch = emailString.match(/<(.+?)>/)
  if (emailMatch && emailMatch[1]) {
    emailAddress = emailMatch[1].trim()
  }

  // Validate email format using Zod
  const emailSchema = z.string().email()
  const result = emailSchema.safeParse(emailAddress)

  return result.success ? result.data : null
}

/**
 * Checks if the email sender is authorized to submit emails for the project.
 * A sender is approved if they are either:
 * 1. A system admin (has ADMIN role)
 * 2. A project team member (has a Membership record)
 */
export const isAdminOrProjectMember = async ({
  projectId,
  email,
}: {
  projectId: number
  email: string | null
}) => {
  if (!email) {
    return false
  }

  // Extract and validate email address
  const emailAddress = extractEmailAddress(email)
  if (!emailAddress) {
    return false
  }

  const normalizedEmail = emailAddress.toLowerCase()

  // Check if sender is an admin user
  const adminUser = await db.user.findFirst({
    where: {
      email: normalizedEmail,
      role: "ADMIN",
    },
  })

  if (adminUser) {
    return true
  }

  // Check if sender is a project team member (via User -> Membership)
  const membership = await db.membership.findFirst({
    where: {
      projectId,
      user: {
        email: normalizedEmail,
      },
    },
  })

  if (membership) {
    return true
  }

  // for now, we only check memberships
  // const contact = await db.contact.findFirst({
  //   where: {
  //     projectId,
  //     email: normalizedEmail,
  //   },
  // })

  // if (contact) {
  //   return true
  // }

  // Sender is not approved
  return false
}
