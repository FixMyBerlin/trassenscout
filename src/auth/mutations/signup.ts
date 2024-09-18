import db from "@/db"
import { userCreatedNotificationToAdmin } from "@/emails/mailers/userCreatedNotificationToAdmin"
import { getFullname } from "@/src/users/utils/getFullname"
import { SecurePassword } from "@blitzjs/auth/secure-password"
import { resolver } from "@blitzjs/rpc"
import { getMemberships } from "../getMemberships"
import { Signup } from "../validations"

export default resolver.pipe(
  resolver.zod(Signup),
  async ({ email, firstName, lastName, password, phone, institution }, ctx) => {
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
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        institution: true,
      },
    })

    await ctx.session.$create({
      userId: user.id,
      role: user.role,
      ...(await getMemberships(user.id)),
    })

    // Mail: Notify Admins
    await (
      await userCreatedNotificationToAdmin({
        userMail: user.email,
        userId: user.id,
        userName: getFullname(user),
        userMembershipCount: user.memberships.length,
      })
    ).send()
    return user
  },
)
