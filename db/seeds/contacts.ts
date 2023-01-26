import db, { Contact } from "../index"

const seedContacts = async () => {
  const seedContacts: Omit<Contact, "id" | "createdAt" | "updatedAt">[] = [
    {
      firstName: null,
      lastName: "Svenson",
      email: "sven@fixmycity.de",
      note: `## Cernis femori deae urbes ora traxit despice
      ## Est digitis rogus

Lorem markdownum: saevorum officio dedit; quod vel dammis. Alis vox ut lauro
quantum!
[siqua](http://causa.net/). Albis
      colebat res quid arguis?`,
      role: "Member",
      phone: "030-123 123",
      projectId: 1,
    },
    {
      firstName: "Tobias",
      lastName: "Jordans",
      email: "tobias@fixmycity.de",
      note: null,
      role: null,
      phone: null,
      projectId: 1,
    },
    {
      firstName: "Johanna",
      lastName: "Michel",
      email: "johanna@fixmycity.de",
      note: `Lorem markdownum lacer. Erat adspicerent soporem percussit caelo Lelegeia,
      doluit, [quamvis](http://vultu.com/deus), at fessam cunctisque nuntiat fert viis
      qualem. Developer`,
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
