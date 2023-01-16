import db, { Project, Section } from "../index"

const seedSections = async () => {
  const seeData: Omit<Section, "id" | "createdAt" | "updatedAt">[] = [
    {
      name: "Section 1",
      description: `*Lorem ipsum dolor sit amet*, consetetur sadipscing elitr.

        Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.

        Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.`,
      managerId: 1,
      projectId: 1,
    },
    {
      name: "Section 2",
      description: null,
      managerId: 1,
      projectId: 1,
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
