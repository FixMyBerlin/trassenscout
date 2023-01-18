import db, { Section } from "../index"

const seedSections = async () => {
  const seeData: Omit<Section, "id" | "createdAt" | "updatedAt">[] = [
    // Project 1:
    {
      slug: "teilstrecke-1",
      name: "Teilstrecke 1: Spree",
      index: 1,
      description: `*Lorem ipsum dolor sit amet*, consetetur sadipscing elitr.

Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.

Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.`,
      managerId: 1,
      projectId: 1,
    },
    {
      slug: "teilstrecke-2",
      name: "Teilstrecke 2: Kanal",
      index: 2,
      description: null,
      managerId: 1,
      projectId: 1,
    },
    // Project 2:
    {
      slug: "teilstrecke-1",
      name: "Teilstrecke 1",
      index: 2,
      description: null,
      managerId: 1,
      projectId: 2,
    },
    // Project 4:
    // Blank
    // Project 4:
    {
      slug: "teilstrecke-1",
      name: "Teilstrecke 1",
      index: 2,
      description: null,
      managerId: 1,
      projectId: 4,
    },
  ]

  for (let i = 0; i < seeData.length; i++) {
    const data = seeData[i]
    if (data) {
      await db.section.create({ data })
    }
  }
}

export default seedSections
