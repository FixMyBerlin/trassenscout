import db, { Prisma } from "../index"

const seedSubsections = async () => {
  const seeData: Prisma.SubsectionUncheckedCreateInput[] = [
    // Section 1:
    {
      slug: "abschnitt-hansaviertel",
      title: "Abschnitt 1 Hansaviertel",
      description: `Das Hansaviertel ist ein Stadtviertel in Berlin, das in den 1950er Jahren nach Plänen bekannter Architekten wie Walter Gropius, Alvar Aalto und Oscar Niemeyer erbaut wurde. Es liegt zwischen dem Berliner Tiergarten und dem Spreeufer und wurde als Modellprojekt für modernes, funktionales Wohnen konzipiert.`,
      geometry: JSON.stringify([
        [13.363361116374904, 52.519430986022115],
        [13.357157800454104, 52.517204842057566],
        [13.350954484534668, 52.51914062581497],
        [13.345069287379602, 52.52262482165125],
        [13.33966126837197, 52.52233448255228],
        [13.334253249364252, 52.51701125899095],
        [13.329481467886865, 52.5184631112015],
        [13.327890874060671, 52.523108715884604],
        [13.322641914435906, 52.5248506909908],
        [13.318029192341385, 52.52262482165125],
        [13.317392954811083, 52.52039883952099],
      ]),
      managerId: 1,
      sectionId: 1,
      subsubsections: {
        create: [
          {
            slug: "teilplanung-1",
            title: "Teilplanung 1",
            description: "Das Hansaviertel ist ein Stadtteil im Zentrum von Berlin - Teilplanung 1",
            geometry: JSON.stringify([
              [13.363361116374904, 52.519430986022115],
              [13.357157800454104, 52.517204842057566],
            ]),
            guidance: "* guidance 1 *",
            task: "* task 1 *",
            length: 0.487,
            width: 1,
          },
          {
            slug: "teilplanung-2",
            title: "Teilplanung 2",
            description: "Das Hansaviertel ist ein Stadtteil im Zentrum von Berlin - Teilplanung 2",
            geometry: JSON.stringify([
              [13.350954484534668, 52.51914062581497],
              [13.345069287379602, 52.52262482165125],
              [13.33966126837197, 52.52233448255228],
            ]),
            guidance: "* guidance 2 *",
            task: "* task 2 *",
            length: 0.922,
            width: 2,
          },
          {
            slug: "teilplanung-3",
            title: "Teilplanung 3",
            description: "Das Hansaviertel ist ein Stadtteil im Zentrum von Berlin - Teilplanung 3",
            geometry: JSON.stringify([
              [13.334253249364252, 52.51701125899095],
              [13.329481467886865, 52.5184631112015],
              [13.327890874060671, 52.523108715884604],
              [13.322641914435906, 52.5248506909908],
            ]),
            guidance: "* guidance 3 *",
            task: "* task 3 *",
            length: 1.293,
            width: 3,
          },
        ],
      },
    },
    {
      slug: "abschnitt-hbf",
      title: "Abschnitt Hauptbahnhof",
      description: null,
      geometry: JSON.stringify([
        [13.392787102151175, 52.52243126246529],
        [13.387538142526438, 52.52204414153442],
        [13.381493885988561, 52.51904383865252],
        [13.37656304512825, 52.520011700680215],
        [13.375131510684866, 52.52233448255228],
        [13.369246313529857, 52.52252804216468],
        [13.36352017575777, 52.519430986022115],
      ]),
      managerId: 1,
      sectionId: 1,
    },
    {
      slug: "abschnitt-insel",
      title: "Abschnitt Museumsinsel",
      description: null,
      geometry: JSON.stringify([
        [13.410442693616204, 52.514591398693426],
        [13.405352793374334, 52.51565615364305],
        [13.399308536836458, 52.521366671697535],
        [13.392787102151175, 52.52252804216468],
      ]),
      managerId: 1,
      sectionId: 1,
    },
    {
      slug: "abschnitt-east-side",
      title: "Abschnitt East Side",
      description: null,
      geometry: JSON.stringify([
        [13.451639073702552, 52.499875779590525],
        [13.421258731631525, 52.51333301867112],
        [13.415532593858103, 52.51488178896585],
        [13.41060175299907, 52.514591398693426],
      ]),
      managerId: 1,
      sectionId: 1,
    },
    // Section 2:
    {
      slug: "abschnitt-tiergarten",
      title: "Abschnitt Tiergarten",
      description: null,
      geometry: JSON.stringify([
        [13.317597867354067, 52.52004509035683],
        [13.3314161960285, 52.51250603081962],
        [13.33697529376991, 52.51115272935999],
        [13.35222310471977, 52.5057391067665],
      ]),
      managerId: 2,
      sectionId: 2,
    },
    {
      slug: "abschnitt-gleisdreieck",
      title: "Abschnitt Gleisdreieck",
      description: null,
      geometry: JSON.stringify([
        [13.35206427335541, 52.505835784446134],
        [13.357305708370632, 52.50670587399276],
        [13.362705974747598, 52.5055457507697],
        [13.369218060675223, 52.505835784446134],
        [13.37525365250832, 52.502645308750346],
        [13.379859762067383, 52.49916452570534],
        [13.388754318454033, 52.49800420344744],
      ]),
      managerId: 2,
      sectionId: 2,
    },
    {
      slug: "abschnitt-urbahnhafen",
      title: "Abschnitt Urbahnhafen",
      description: null,
      geometry: JSON.stringify([
        [13.388480650254337, 52.497979825501545],
        [13.395628061636813, 52.49788313054404],
        [13.41278184895532, 52.4950788842759],
        [13.41977042897335, 52.49614258494796],
      ]),
      managerId: 2,
      sectionId: 2,
    },
    {
      slug: "abschnitt-paul-lincke-ufer",
      title: "Abschnitt Paul Lincke Ufer",
      description: null,
      geometry: JSON.stringify([
        [13.41977042897335, 52.49633598230557],
        [13.439306686753582, 52.4902435569129],
        [13.451695533149916, 52.49991367999152],
      ]),
      managerId: 2,
      sectionId: 2,
    },
    // Seection 3:
    {
      slug: "abschnitt-1",
      title: "Abschnitt 1",
      description: null,
      geometry: JSON.stringify([
        [13.41977042897335, 52.49633598230557],
        [13.439306686753582, 52.4902435569129],
        [13.451695533149916, 52.49991367999152],
      ]),
      managerId: 2,
      sectionId: 3,
    },
  ]

  for (let i = 0; i < seeData.length; i++) {
    const data = seeData[i]
    if (data) {
      // TODO: Figure out why this `any` is needed
      await db.subsection.create({ data } as any)
    }
  }
}

export default seedSubsections
