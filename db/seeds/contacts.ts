import db, { Contact } from "../index"

const seedContacts = async () => {
  const seedContacts: Omit<Contact, "id" | "createdAt" | "updatedAt">[] = [
    {
      name: "Sven",
      email: "sven@fixmycity.de",
      title: "Developer",
      role: "Member",
      phone: "030-123 123",
      projectId: 1,
    },
    {
      name: "Tobias Jordans",
      email: "tobias@fixmycity.de",
      title: null,
      role: null,
      phone: null,
      projectId: 1,
    },
    {
      name: "Johanna",
      email: "johanna@fixmycity.de",
      title: "Developer",
      role: "Member",
      phone: "030-123 123",
      projectId: 2,
    },
  ]

  for (let i = 0; i < seedContacts.length; i++) {
    const data = seedContacts[i]
    if (data) {
      await db.contact.create({ data })
    }
  }
}

export default seedContacts
