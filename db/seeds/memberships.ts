import { Prisma } from "@prisma/client"
import db from "../index"
import { generateUserEmail } from "./users"

type Memberships = Prisma.MembershipUncheckedCreateInput[]

const seedMemberships = async () => {
  const projects = await db.project.findMany()
  const users = await db.user.findMany()
  const usersByEmail = Object.fromEntries(users.map((user) => [user.email, user]))

  let projectMemberships: Memberships = projects.map(({ id, slug }) => ({
    projectId: id,
    // @ts-ignore
    userId: usersByEmail[generateUserEmail(slug)].id,
  }))

  // @ts-ignore
  const allProjectsAdminId = usersByEmail["all-projects@fixmycity.de"].id
  let allMemberships: Memberships = projects.map(({ id }) => ({
    projectId: id,
    // @ts-ignore
    userId: allProjectsAdminId,
  }))

  const memberships = [...projectMemberships, ...allMemberships]

  for (let i = 0; i < memberships.length; i++) {
    const data = memberships[i]
    if (data) {
      await db.membership.create({ data })
    }
  }
}

export default seedMemberships
