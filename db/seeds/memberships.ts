import db, { Membership } from "../index"

const seedMemberships = async () => {
  const memberships: Omit<Membership, "id">[] = [
    {
      projectId: 1, // rs-spree
      userId: 3,    // rs3000-user@fixmycity.de
    },
  ]

  for (let i = 0; i < memberships.length; i++) {
    const data = memberships[i]
    if (data) {
      await db.membership.create({ data })
    }
  }
}

export default seedMemberships
