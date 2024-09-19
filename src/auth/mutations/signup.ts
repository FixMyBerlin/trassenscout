import db from "@/db"
import { userCreatedNotificationToAdmin } from "@/emails/mailers/userCreatedNotificationToAdmin"
import { userCreatedNotificationToUser } from "@/emails/mailers/userCreatedNotificationToUser"
import { getFullname } from "@/src/users/utils/getFullname"
import { SecurePassword } from "@blitzjs/auth/secure-password"
import { Routes } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { checkAndUpdateInvite } from "../shared/checkAndUpdateInvite"
import { notifyEditorsAboutNewMembership } from "../shared/notifyEditorsAboutNewMembership"
import { selectUserFieldsForSession } from "../shared/selectUserFieldsForSession"
import { Signup } from "../validations"

export default resolver.pipe(
  resolver.zod(Signup),
  async ({ email, firstName, lastName, password, phone, institution, inviteToken }, ctx) => {
    // Case: Invite
    const invite = await checkAndUpdateInvite(inviteToken, email)

    const hashedPassword = await SecurePassword.hash(password.trim())
    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        firstName,
        lastName,
        hashedPassword,
        role: "USER",
        phone,
        institution,
        // Case: Invite
        memberships: invite
          ? { create: { projectId: invite.projectId, role: invite.role } }
          : undefined,
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        ...selectUserFieldsForSession,
      },
    })

    await ctx.session.$create({
      userId: user.id,
      role: user.role,
      memberships: user.memberships,
    })

    // Mail: Notify User
    await (
      await userCreatedNotificationToUser({
        user: { email: user.email, name: getFullname(user) || "" },
        path: Routes.Home(),
      })
    ).send()

    // Mail: Notify Admins
    await (
      await userCreatedNotificationToAdmin({
        userMail: user.email,
        userId: user.id,
        userName: getFullname(user),
        userMembershipCount: user.memberships.length,
      })
    ).send()

    // Case: Invite
    await notifyEditorsAboutNewMembership({ invite, invitee: user })

    return user
  },
)
