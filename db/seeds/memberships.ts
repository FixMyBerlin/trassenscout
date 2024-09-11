import { Prisma } from "@prisma/client"
import db from "../index"
import { generateUserEmail } from "./users"

type Memberships = Prisma.MembershipUncheckedCreateInput[]

const seedMemberships = async () => {
  const projects = await db.project.findMany()
  const users = await db.user.findMany()
  const usersByEmail = Object.fromEntries(users.map((user) => [user.email, user]))

  const projectMemberships: Memberships = projects.map(({ id, slug }) => ({
    projectId: id,
    userId: usersByEmail[generateUserEmail(slug)]!.id,
    role: "VIEWER",
  }))

  const allMembershipsViewer: Memberships = projects.map(({ id }) => ({
    projectId: id,
    userId: usersByEmail["all-projects-viewer@fixmycity.de"]!.id,
    role: "VIEWER",
  }))

  const allMembershipsEditor: Memberships = projects.map(({ id }) => ({
    projectId: id,
    userId: usersByEmail["all-projects-editor@fixmycity.de"]!.id,
    role: "EDITOR",
  }))

  const memberships = [...allMembershipsViewer, ...allMembershipsEditor, ...projectMemberships]

  for (const data of memberships) {
    await db.membership.create({ data })
  }
}

export default seedMemberships
