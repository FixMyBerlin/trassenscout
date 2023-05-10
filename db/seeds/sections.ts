import db, { Prisma } from "../index"

const seedSections = async () => {
  const seedData: Prisma.SectionUncheckedCreateInput[] = [
    // Project 1:
    {
      slug: "teilstrecke-1",
      title: "Teilstrecke 1",
      subTitle: "Route Spree",
      index: 1,
      length: "7",
      description: `*Lorem ipsum dolor sit amet*, consetetur sadipscing elitr.

Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.

Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.`,
      start: "Dovestraẞe",
      end: "Schleusenufer",
      labelPos: "topRight",
      managerId: 1,
      projectId: 1,
    },
    {
      slug: "teilstrecke-2",
      title: "Teilstrecke 2",
      subTitle: "Route Kanal",
      index: 2,
      length: "7,3",
      description: null,
      start: "Dovestraẞe",
      end: "Schleusenufer",
      labelPos: "bottomLeft",
      managerId: 1,
      projectId: 1,
    },
    // Project 2:
    {
      slug: "teilstrecke-1",
      title: "Teilstrecke ",
      subTitle: null,
      index: 2,
      length: null,
      description: null,
      start: "start teilstrecke",
      end: "end teilstrecke",
      labelPos: "top",
      managerId: 1,
      projectId: 2,
    },
    // Project 4:
    // Blank
    // Project 4:
    {
      slug: "teilstrecke-1",
      title: "Teilstrecke ",
      subTitle: null,
      index: 2,
      length: "14",
      description: null,
      start: "start teilstrecke",
      end: "end teilstrecke",
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
