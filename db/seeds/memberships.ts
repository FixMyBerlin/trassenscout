import { Prisma } from "@prisma/client"
import db from "../index"
import { generateUserEmail } from "./users"

type Memberships = Prisma.MembershipUncheckedCreateInput[]

const seedMemberships = async () => {
  const projects = await db.project.findMany()
  const users = await db.user.findMany()
  const usersByEmail = Object.fromEntries(users.map((user) => [user.email, user]))

  // Get RS3000 and RS23 projects
  const rs3000Project = projects.find((p) => p.slug === "rs3000")
  const rs23Project = projects.find((p) => p.slug === "rs23")

  const projectMemberships: Memberships = projects.map(({ id, slug }) => ({
    projectId: id,
    userId: usersByEmail[generateUserEmail(slug)]!.id,
    role: "VIEWER",
  }))

  const allMembershipsViewer: Memberships = projects.map(({ id }) => ({
    projectId: id,
    userId: usersByEmail["all-projects-viewer@fixmycity.test"]!.id,
    role: "VIEWER",
  }))

  const allMembershipsEditor: Memberships = projects.map(({ id }) => ({
    projectId: id,
    userId: usersByEmail["all-projects-editor@fixmycity.test"]!.id,
    role: "EDITOR",
  }))

  // Add RS3000 and RS23 permissions for all users
  const rs3000AndRs23Memberships: Memberships = []
  if (rs3000Project && rs23Project) {
    for (const user of users) {
      // Skip admin user if needed, or include all
      rs3000AndRs23Memberships.push(
        {
          projectId: rs3000Project.id,
          userId: user.id,
          role: "VIEWER",
        },
        {
          projectId: rs23Project.id,
          userId: user.id,
          role: "VIEWER",
        },
      )
    }
  }

  const memberships = [
    ...allMembershipsViewer,
    ...allMembershipsEditor,
    ...projectMemberships,
    ...rs3000AndRs23Memberships,
  ]

  for (const data of memberships) {
    await db.membership.upsert({
      where: {
        projectId_userId: {
          projectId: data.projectId,
          userId: data.userId,
        },
      },
      update: {
        role: data.role,
      },
      create: data,
    })
  }
}

export default seedMemberships
