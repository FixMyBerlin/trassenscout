import db, { Prisma } from "../index"

const seedSections = async () => {
  const seedData: Prisma.SectionUncheckedCreateInput[] = [
    // Project 1:
    {
      projectId: 1,
      slug: "TS1",
      start: "Dovestraẞe",
      end: "Schleusenufer",
      order: 1,
      description: `*Lorem ipsum dolor sit amet*, consetetur sadipscing elitr.

Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.

- Foo
- Bar

Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.`,
      labelPos: "topRight",
      managerId: 1,
    },
    {
      projectId: 1,
      slug: "TS2",
      start: "Dovestraẞe",
      end: "Schleusenufer",
      order: 2,
      description: null,
      labelPos: "bottomLeft",
      managerId: 1,
    },
    // Project 2:
    {
      projectId: 2,
      slug: "TS3",
      start: "startString",
      end: "endString",
      order: 3,
      description: null,
      labelPos: "top",
      managerId: 1,
    },
    // Project 4:
    // Blank
    {
      projectId: 4,
      slug: "TS4",
      start: "startString2",
      end: "endString2",
      order: 4,
      description: null,
      labelPos: "top",
      managerId: 1,
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
