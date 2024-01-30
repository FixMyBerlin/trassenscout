import db, { Prisma } from "../index"
import { subsubsections } from "./subsection_subsubsections"

// lengthKm is NOT calculated here but arbitrary values to satisfy the schema

const seedSubsections = async () => {
  const seedData: Prisma.SubsectionUncheckedCreateInput[] = [
    // NORD:
    {
      projectId: 1,
      operatorId: 1,
      slug: "pa1",
      order: 1,
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
      lengthKm: 56,
      managerId: 1,
      subsubsections: { create: subsubsections },
    },
    {
      projectId: 1,
      operatorId: 1,
      slug: "pa2",
      order: 2,
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
      lengthKm: 12,
      managerId: null,
    },
    {
      projectId: 1,
      operatorId: 1,
      slug: "pa3",
      order: 3,
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
      lengthKm: 12,
      managerId: null,
    },
    {
      projectId: 1,
      operatorId: 1,
      slug: "pa4",
      order: 4,
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
      lengthKm: 12,
      managerId: 1,
    },
    // SÜD:
    {
      projectId: 1,
      operatorId: 2,
      slug: "pa5",
      order: 5,
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
      lengthKm: 12,
      managerId: 2,
    },
    {
      projectId: 1,
      operatorId: 2,
      slug: "pa6",
      order: 6,
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
      lengthKm: 12,
      managerId: 2,
    },
    {
      projectId: 1,
      operatorId: 2,
      slug: "pa7",
      order: 7,
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
      lengthKm: 12,
      managerId: 2,
    },
    {
      projectId: 1,
      operatorId: 2,
      slug: "pa8",
      order: 8,
      start: "Kottbusser Damm",
      end: "Schleusenufer",
      description: null,
      labelPos: "bottom",
      geometry: [
        [13.41977042897335, 52.49633598230557],
        [13.439306686753582, 52.4902435569129],
        [13.451695533149916, 52.49991367999152],
      ],
      lengthKm: 3,
      managerId: 2,
    },
    {
      projectId: 1,
      operatorId: 2,
      slug: "pa9",
      order: 9,
      start: "Schleusenufer",
      end: "Kottbusser Brücke",
      description: null,
      labelPos: "bottom",
      geometry: [
        [13.41977042897335, 52.49633598230557],
        [13.439306686753582, 52.4902435569129],
        [13.451695533149916, 52.49991367999152],
      ],
      lengthKm: 8,
      managerId: 2,
    },
  ]

  for (let i = 0; i < seedData.length; i++) {
    const data = seedData[i]
    if (data) {
      await db.subsection.create({ data })
    }
  }
}

export default seedSubsections
