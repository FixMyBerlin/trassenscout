import { SecurePassword } from "@blitzjs/auth/secure-password"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { Signup } from "../validations"
import { userCreationMailer } from "mailers/userCreationMailer"
import { getMemberships } from "../getMemberships"

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
    await userCreationMailer({
      userMail: user.email,
      userId: user.id,
      userFirstname: user.firstName,
      userLastname: user.lastName,
      // todo institution?
    }).send()
    return user
  },
)
