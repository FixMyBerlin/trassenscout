import db, { Project } from "../index"

const seedProjects = async () => {
  const seeData: Omit<Project, "id" | "createdAt" | "updatedAt">[] = [
    {
      slug: "rs3000",
      name: "Radschnellverbindung 3000",
      shortName: "RS3k",
      description: `*Lorem ipsum dolor sit amet*, consetetur sadipscing elitr.

Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.`,
      managerId: 1,
    },
    {
      slug: "rs3001",
      name: "Radschnellverbindung 3001",
      shortName: null,
      description: null,
      managerId: 2,
    },
  ]

  for (let i = 0; i < seeData.length; i++) {
    const data = seeData[i]
    if (data) {
      await db.project.create({ data })
    }
  }
}

export default seedProjects
