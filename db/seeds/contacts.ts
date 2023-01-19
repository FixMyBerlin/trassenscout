import db, { Contact } from "../index"

const seedContacts = async () => {
  const seedContacts: Omit<Contact, "id" | "createdAt" | "updatedAt">[] = [
    {
      firstName: null,
      lastName: "Svenson",
      email: "sven@fixmycity.de",
      title: "Developer",
      role: "Member",
      phone: "030-123 123",
      projectId: 1,
    },
    {
      firstName: "Tobias",
      lastName: "Jordans",
      email: "tobias@fixmycity.de",
      title: null,
      role: null,
      phone: null,
      projectId: 1,
    },
    {
      firstName: "Johanna",
      lastName: "Michel",
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
