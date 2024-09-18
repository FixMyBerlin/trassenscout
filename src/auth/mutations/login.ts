import db from "@/db"
import { SecurePassword } from "@blitzjs/auth/secure-password"
import { resolver } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"
import { checkAndUpdateInvite } from "../shared/checkAndUpdateInvite"
import { notifyEditorsAboutNewMembership } from "../shared/notifyEditorsAboutNewMembership"
import { selectUserFieldsForSession } from "../shared/selectUserFieldsForSession"
import { Login } from "../validations"

export const authenticateUser = async (rawEmail: string, rawPassword: string) => {
  const { email, password } = Login.parse({ email: rawEmail, password: rawPassword })

  const user = await db.user.findFirst({
    where: { email },
    select: {
      ...selectUserFieldsForSession,
      hashedPassword: true,
    },
  })
  if (!user) throw new AuthenticationError()

  const result = await SecurePassword.verify(user.hashedPassword, password)

  if (result === SecurePassword.VALID_NEEDS_REHASH) {
    // Upgrade hashed password with a more secure hash
    const improvedHash = await SecurePassword.hash(password)
    await db.user.update({ where: { id: user.id }, data: { hashedPassword: improvedHash } })
  }

  const { hashedPassword, ...returnUser } = user
  return returnUser
}

export default resolver.pipe(resolver.zod(Login), async ({ email, password, inviteToken }, ctx) => {
  // This throws an error if credentials are invalid
  let user = await authenticateUser(email, password)

  // Case: Invite
  const invite = await checkAndUpdateInvite(inviteToken, email)
  if (invite) {
    user = await db.user.update({
      where: { id: user.id },
      data: {
        memberships: { create: { projectId: invite.projectId, role: invite.role } },
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        ...selectUserFieldsForSession,
      },
    })

    // @ts-expect-error the user types don't get updated inside this block, so they are missing the name props
    await notifyEditorsAboutNewMembership({ invite, invitee: user })
  }

  await ctx.session.$create({
    userId: user.id,
    role: user.role,
    memberships: user.memberships,
  })

  return user
})
