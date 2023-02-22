import db, { Membership } from "../index"

const seedMemberships = async () => {
  const allProjects = db.project.findMany()
  const memberships: Omit<Membership, "id">[] = [
    {
      projectId: 1, // rs-spree
      userId: 3, // rs-spree-permissions@fixmycity.de
    },
    ...(await allProjects).map((p) => ({
      projectId: p.id,
      userId: 4, // all-projects-permissions@fixmycity.de
    })),
  ]

  for (let i = 0; i < memberships.length; i++) {
    const data = memberships[i]
    if (data) {
      await db.membership.create({ data })
    }
  }
}

export default seedMemberships
