import db from "@/db"
import { userCreatedNotificationToAdmin } from "@/emails/mailers/userCreatedNotificationToAdmin"
import { userCreatedNotificationToUser } from "@/emails/mailers/userCreatedNotificationToUser"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import { SecurePassword } from "@blitzjs/auth/secure-password"
import { resolver } from "@blitzjs/rpc"
import { RouteUrlObject } from "blitz"
import { SignupSchema } from "../schema"
import { createInviteLogEntry } from "../shared/createInviteLogEntry"
import { getInvite } from "../shared/getInvite"
import { notifyEditorsAboutNewMembership } from "../shared/notifyEditorsAboutNewMembership"
import { selectUserFieldsForSession } from "../shared/selectUserFieldsForSession"
import { updateInvite } from "../shared/updateInvite"

export default resolver.pipe(
  resolver.zod(SignupSchema),
  async ({ email, firstName, lastName, password, phone, institution, inviteToken }, ctx) => {
    // Case: Invite
    let invite = await getInvite(inviteToken, email)

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

    // Case: Invite
    invite = await updateInvite(inviteToken, email)

    // Mail: Notify User
    await (
      await userCreatedNotificationToUser({
        user: { email: user.email, name: getFullname(user) || "" },
        path: { pathname: "/", query: undefined, href: "/" } satisfies RouteUrlObject,
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

    // Case: Logging
    await createInviteLogEntry({ invite, invitee: user })

    return user
  },
)
