import db, { Prisma } from "../index"

const seedSections = async () => {
  const seedData: Prisma.SectionUncheckedCreateInput[] = [
    // Project 1:
    {
      slug: "ts-1",
      title: "Spree",
      start: "Dovestraẞe",
      end: "Schleusenufer",
      index: 1,
      length: "7",
      description: `*Lorem ipsum dolor sit amet*, consetetur sadipscing elitr.

Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.

- Foo
- Bar

Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.`,
      labelPos: "topRight",
      managerId: 1,
      projectId: 1,
    },
    {
      slug: "ts-2",
      title: "Kanal",
      start: "Dovestraẞe",
      end: "Schleusenufer",
      index: 2,
      length: "7,3",
      description: null,
      labelPos: "bottomLeft",
      managerId: 1,
      projectId: 1,
    },
    // Project 2:
    {
      slug: "ts-77",
      title: "titleString",
      start: "startString",
      end: "endString",
      index: 2,
      length: null,
      description: null,
      labelPos: "top",
      managerId: 1,
      projectId: 2,
    },
    // Project 4:
    // Blank
    {
      slug: "ts-881",
      title: "titleString2",
      start: "startString2",
      end: "endString2",
      index: 2,
      length: "14",
      description: null,
      labelPos: "top",
      managerId: 1,
      projectId: 4,
    },
  ]

  for (let i = 0; i < seedData.length; i++) {
    const data = seedData[i]
    if (data) {
      await db.section.create({ data })
    }
  }
}

export default seedSections
