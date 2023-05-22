import { Prisma } from "@prisma/client"

export const subsubsections: Omit<Prisma.SubsubsectionUncheckedCreateInput, "subsectionId">[] = [
  {
    slug: "RF1",
    subTitle: "Radweg mit landw. Verkehr frei",
    order: 1,
    type: "ROUTE",
    geometry: [
      [13.363361116374904, 52.519430986022115],
      [13.357157800454104, 52.517204842057566],
    ],
    labelPos: "topLeft",
    task: "Ausbau Feldweg",
    length: 0.487,
    width: 3,
    costEstimate: 10_000,
    description:
      "Ausweitung des Straßenbegleitenden **Feldweges zum Radweg**. Freigabe für landwirtschaftlichen Verkehr.",
    managerId: 1,
  },
  {
    slug: "RF2",
    subTitle: "Ufersteg Hansaviertel",
    order: 2,
    type: "ROUTE",
    geometry: [
      [13.350954484534668, 52.51914062581497],
      [13.345069287379602, 52.52262482165125],
      [13.33966126837197, 52.52233448255228],
    ],
    labelPos: "bottomLeft",
    task: "Ufersteg anlegen",
    length: 0.922,
    width: 3,
    costEstimate: null,
    description: "Rad- und Fußverkehr wird auf einem Ufersteig zum Teil über dem Wasser geführt.",
    managerId: 1,
  },
  {
    slug: "RF3",
    subTitle: "Fahrradstraße Levetzowstraße",
    order: 3,
    type: "ROUTE",
    geometry: [
      [13.334253249364252, 52.51701125899095],
      [13.329481467886865, 52.5184631112015],
      [13.327890874060671, 52.523108715884604],
      [13.322641914435906, 52.5248506909908],
    ],
    labelPos: "left",
    task: "Fahrradstraße gestalten",
    length: 1.293,
    width: 4,
    costEstimate: 20_000,
    description: "Ausbau Levetzowstraße zur Fahrradstraße mit Modalfilter, Anwohner frei.",
    managerId: 2,
  },
  {
    slug: "SF1",
    subTitle: "Radweg auf Gotskowskybrücke",
    order: 5,
    type: "AREA",
    geometry: [13.329078172644188, 52.5225862734311],
    labelPos: "top",
    task: "Fahrbahnmarkierung mit Querung",
    length: null,
    width: 2,
    costEstimate: 30_000,
    description: `
**Sonderführung Radverkehr über Gotskowskybrücke.** Radweg auf einer Seite für beide Fahrtrichtungen. Schutz vor Kfz durch Betonschwellen.

- Foo
- Bar
      `,
    managerId: 1,
  },
  {
    slug: "SF2",
    subTitle: "Radweg unter S-Bahn-Brücke",
    order: 6,
    type: "AREA",
    geometry: [13.350034203659277, 52.51973770393019],
    labelPos: "top",
    task: "Umgestaltung Seitenraum",
    length: 0.5,
    width: 2,
    costEstimate: 10_000,
    description:
      "Sonderführung Radverkehr unter der S-Bahn-Brücke im Seitenraum. Wegfall von einzelnen Kfz Stellplätzen; Neuaufteilung Parkspur, Radweg und Gehweg.",
    managerId: 3,
  },
]
