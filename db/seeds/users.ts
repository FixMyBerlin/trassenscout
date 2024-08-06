import db from "../index"
import { Prisma } from "@prisma/client"

type Users = Prisma.UserUncheckedCreateInput[]

export const generateUserEmail = (slug: string) => `${slug}@fixmycity.de`
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const seedUsers = async () => {
  const allProjects = await db.project.findMany()
  // password: dev-team@fixmycity.de
  const hashedPassword =
    "JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTIscD0xJDRMWm82dmVrRk91VnVlZTVwcEpiS3ckOHFZcHhyM2RITm0yTGxTeXdqeEcxSWFsZEJCUWhxNVZxdm53eHoxTk4xTQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="

  let genericUsers: Users = [
    {
      email: "admin@fixmycity.de",
      role: "ADMIN",
      firstName: "Admin",
      lastName: "Admin-User",
      phone: "030 549 086 65 - 90",
      hashedPassword,
    },
    {
      email: "all-projects@fixmycity.de",
      role: "USER",
      firstName: "All-Projects",
      lastName: "All-Projects-User",
      institution: "All-Project-Institution",
      phone: "030 549 086 65 - 91",
      hashedPassword,
    },
    {
      email: "no-project@fixmycity.de",
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
    phone: `030 549 086 65 - ${id}`,
    hashedPassword,
  }))

  const users = [...genericUsers, ...projectAdmins]
  for (let i = 0; i < users.length; i++) {
    // @ts-ignore
    await db.user.create({ data: users[i] })
  }
}

export default seedUsers
