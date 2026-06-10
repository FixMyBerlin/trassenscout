import { Prisma } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"

type Users = Prisma.UserUncheckedCreateInput[]

const credentialProviderId = "credential"

export const generateUserEmail = (slug: string) => `${slug}@fixmycity.test`

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const seedUsers = async () => {
  const allProjects = await db.project.findMany()
  // password: dev-team@fixmycity.de
  const hashedPassword =
    "JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTIscD0xJDRMWm82dmVrRk91VnVlZTVwcEpiS3ckOHFZcHhyM2RITm0yTGxTeXdqeEcxSWFsZEJCUWhxNVZxdm53eHoxTk4xTQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="

  const genericUsers: Users = [
    {
      email: "admin@fixmycity.test",
      role: "ADMIN",
      firstName: "Admin",
      lastName: "Admin-User",
      phone: "030 549 086 65 - 90",
      hashedPassword,
    },
    {
      email: "all-projects-viewer@fixmycity.test",
      role: "USER",
      firstName: "All-Projects",
      lastName: "Viewer-User",
      institution: "All-Project-Institution",
      phone: "030 549 086 65 - 91",
      hashedPassword,
    },
    {
      email: "all-projects-editor@fixmycity.test",
      role: "USER",
      firstName: "All-Projects",
      lastName: "Editor-User",
      institution: "All-Project-Institution",
      phone: "030 549 086 65 - 91",
      hashedPassword,
    },
    {
      email: "no-project@fixmycity.test",
      role: "USER",
      firstName: "No-Project",
      lastName: "No-Project-User",
      phone: "030 549 086 65 - 92",
      institution: "No-Project-Institution",
      hashedPassword,
    },
  ]

  const projectAdmins: Users = allProjects.map(({ id, slug }) => ({
    email: generateUserEmail(slug),
    role: "USER",
    firstName: `${capitalize(slug)}-Admin`,
    lastName: `${capitalize(slug)}-Admin-User`,
    phone: `030 549 086 65-${id}`,
    hashedPassword,
  }))

  const users = [...genericUsers, ...projectAdmins]
  const migratedAt = new Date()

  for (const user of users) {
    const email = user.email!
    const seededUser = await db.user.upsert({
      where: { email },
      create: {
        ...user,
        emailVerified: true,
        name: `${user.firstName} ${user.lastName}`,
        passwordHashMigratedAt: migratedAt,
      },
      update: {
        hashedPassword: user.hashedPassword,
        emailVerified: true,
        passwordHashMigratedAt: migratedAt,
        passwordResetRequired: false,
      },
    })

    if (!seededUser.hashedPassword) continue

    await db.account.upsert({
      where: {
        providerId_accountId: {
          accountId: String(seededUser.id),
          providerId: credentialProviderId,
        },
      },
      create: {
        accountId: String(seededUser.id),
        providerId: credentialProviderId,
        password: seededUser.hashedPassword,
        userId: seededUser.id,
      },
      update: {
        password: seededUser.hashedPassword,
      },
    })
  }
}

export default seedUsers
