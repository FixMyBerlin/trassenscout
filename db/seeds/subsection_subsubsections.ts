import { Prisma } from "@prisma/client"

export const subsubsections: Omit<Prisma.SubsubsectionUncheckedCreateInput, "subsectionId">[] = [
  {
    slug: "teilplanung-1",
    title: "Teilplanung 1",
    description: "Das Hansaviertel ist ein Stadtteil im Zentrum von Berlin - Teilplanung 1",
    labelPos: "topLeft",
    geometry: [
      [13.363361116374904, 52.519430986022115],
      [13.357157800454104, 52.517204842057566],
    ],
    guidance: "* guidance 1 *",
    task: "* task 1 *",
    length: 0.487,
    width: 1,
  },
  {
    slug: "teilplanung-2",
    title: "Teilplanung 2",
    description: "Das Hansaviertel ist ein Stadtteil im Zentrum von Berlin - Teilplanung 2",
    labelPos: "bottomLeft",
    geometry: [
      [13.350954484534668, 52.51914062581497],
      [13.345069287379602, 52.52262482165125],
      [13.33966126837197, 52.52233448255228],
    ],
    guidance: "* guidance 2 *",
    task: "* task 2 *",
    length: 0.922,
    width: 2,
  },
  {
    slug: "teilplanung-3",
    title: "Teilplanung 3",
    description: "Das Hansaviertel ist ein Stadtteil im Zentrum von Berlin - Teilplanung 3",
    labelPos: "left",
    geometry: [
      [13.334253249364252, 52.51701125899095],
      [13.329481467886865, 52.5184631112015],
      [13.327890874060671, 52.523108715884604],
      [13.322641914435906, 52.5248506909908],
    ],
    guidance: "* guidance 3 *",
    task: "* task 3 *",
    length: 1.293,
    width: 3,
  },
]
