import db, { Contact } from "../index"

const seedContacts = async () => {
  const seedContacts: Omit<Contact, "id" | "createdAt" | "updatedAt">[] = [
    {
      name: "Sven",
      email: "sven@fixmycity.de",
      title: "Developer",
      role: "Member",
      phone: "030-123 123",
    },
    {
      name: "Tobias Jordans",
      email: "tobias@fixmycity.de",
      title: null,
      role: null,
      phone: null,
    },
    {
      name: "Johanna",
      email: "johanna@fixmycity.de",
      title: "Developer",
      role: "Member",
      phone: "030-123 123",
    },
  ]

  for (let i = 0; i < seedContacts.length; i++) {
    const data = seedContacts[i]
    if (data) {
      await db.contact.create({
        data,
      })
    }
  }
}

export default seedContacts
