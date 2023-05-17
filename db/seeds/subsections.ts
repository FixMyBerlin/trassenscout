import db, { Prisma } from "../index"
import { subsubsections } from "./subsection_subsubsections"

const seedSubsections = async () => {
  const seeData: Prisma.SubsectionUncheckedCreateInput[] = [
    // Section 1:
    {
      slug: "hansaviertel",
      order: 1,
      title: "Hansaviertel",
      start: "Dovestraẞe",
      end: "Kanzlerpark",
      description: `
**Das Hansaviertel** ist ein Stadtviertel in Berlin, das in den 1950er Jahren nach Plänen bekannter Architekten wie Walter Gropius, Alvar Aalto und Oscar Niemeyer erbaut wurde. Es liegt zwischen dem Berliner Tiergarten und dem Spreeufer und wurde als Modellprojekt für modernes, funktionales Wohnen konzipiert.

- Foo
- Bar
      `,
      labelPos: "top",
      geometry: [
        [13.317392954811083, 52.52039883952099],
        [13.318029192341385, 52.52262482165125],
        [13.322641914435906, 52.5248506909908],
        [13.327890874060671, 52.523108715884604],
        [13.329481467886865, 52.5184631112015],
        [13.334253249364252, 52.51701125899095],
        [13.33966126837197, 52.52233448255228],
        [13.345069287379602, 52.52262482165125],
        [13.350954484534668, 52.51914062581497],
        [13.357157800454104, 52.517204842057566],
        [13.363361116374904, 52.519430986022115],
      ],
      managerId: 1,
      sectionId: 1,
      subsubsections: { create: subsubsections },
    },
    {
      slug: "hbf",
      order: 2,
      title: "Hauptbahnhof",
      start: "Kanzlerpark",
      end: "Ebertsbrücke",
      description: null,
      labelPos: "top",
      geometry: [
        [13.392787102151175, 52.52243126246529],
        [13.387538142526438, 52.52204414153442],
        [13.381493885988561, 52.51904383865252],
        [13.37656304512825, 52.520011700680215],
        [13.375131510684866, 52.52233448255228],
        [13.369246313529857, 52.52252804216468],
        [13.36352017575777, 52.519430986022115],
      ],
      managerId: 1,
      sectionId: 1,
    },
    {
      slug: "insel",
      order: 3,
      title: "Museumsinsel",
      start: "Ebertsbrücke",
      end: "Fischerinsel",
      description: null,
      labelPos: "topRight",
      geometry: [
        [13.410442693616204, 52.514591398693426],
        [13.405352793374334, 52.51565615364305],
        [13.399308536836458, 52.521366671697535],
        [13.392787102151175, 52.52252804216468],
      ],
      managerId: 1,
      sectionId: 1,
    },
    {
      slug: "east-side",
      order: 4,
      title: "East Side",
      start: "Fischerinsel",
      end: "Schleusenufer",
      description: null,
      labelPos: "topRight",
      geometry: [
        [13.41060175299907, 52.514591398693426],
        [13.415532593858103, 52.51488178896585],
        [13.421258731631525, 52.51333301867112],
        [13.451639073702552, 52.499875779590525],
      ],
      managerId: 1,
      sectionId: 1,
    },
    // Section 2:
    {
      slug: "tiergarten",
      order: 5,
      title: "Tiergarten",
      start: "Dovestraẞe",
      end: "Lützowplatz",
      description: null,
      labelPos: "topRight",
      geometry: [
        [13.317597867354067, 52.52004509035683],
        [13.3314161960285, 52.51250603081962],
        [13.33697529376991, 52.51115272935999],
        [13.35222310471977, 52.5057391067665],
      ],
      managerId: 2,
      sectionId: 2,
    },
    {
      slug: "gleisdreieck",
      order: 6,
      title: "Gleisdreieck",
      start: "Lützowplatz",
      end: "Mehringdamm",
      description: null,
      labelPos: "topRight",
      geometry: [
        [13.35206427335541, 52.505835784446134],
        [13.357305708370632, 52.50670587399276],
        [13.362705974747598, 52.5055457507697],
        [13.369218060675223, 52.505835784446134],
        [13.37525365250832, 52.502645308750346],
        [13.379859762067383, 52.49916452570534],
        [13.388754318454033, 52.49800420344744],
      ],
      managerId: 2,
      sectionId: 2,
    },
    {
      slug: "urbahnhafen",
      order: 7,
      title: "Urbahnhafen",
      start: "Mehringdamm",
      end: "Kottbusser Damm",
      description: null,
      labelPos: "topRight",
      geometry: [
        [13.388480650254337, 52.497979825501545],
        [13.395628061636813, 52.49788313054404],
        [13.41278184895532, 52.4950788842759],
        [13.41977042897335, 52.49614258494796],
      ],
      managerId: 2,
      sectionId: 2,
    },
    {
      slug: "paul-lincke-ufer",
      order: 8,
      title: "Paul Lincke Ufer",
      start: "Kottbusser Damm",
      end: "Schleusenufer",
      description: null,
      labelPos: "bottom",
      geometry: [
        [13.41977042897335, 52.49633598230557],
        [13.439306686753582, 52.4902435569129],
        [13.451695533149916, 52.49991367999152],
      ],
      managerId: 2,
      sectionId: 2,
    },
    // Section 3:
    {
      slug: "kanal",
      order: 9,
      title: "Kanal",
      start: "Schleusenufer",
      end: "Kottbusser Brücke",
      description: null,
      labelPos: "bottom",
      geometry: [
        [13.41977042897335, 52.49633598230557],
        [13.439306686753582, 52.4902435569129],
        [13.451695533149916, 52.49991367999152],
      ],
      managerId: 2,
      sectionId: 3,
    },
  ]

  for (let i = 0; i < seeData.length; i++) {
    const data = seeData[i]
    if (data) {
      await db.subsection.create({ data })
    }
  }
}

export default seedSubsections
