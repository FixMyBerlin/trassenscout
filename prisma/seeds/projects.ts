import { Prisma, StateKeyEnum } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"
import { alkisLandAcquisitionDemoProjects } from "./alkisLandAcquisitionDemos"

const seedProjects = async () => {
  const seedData: Prisma.ProjectUncheckedCreateInput[] = [
    {
      slug: "rs23", // "W" ist der 23. Buchstabe
      subTitle: "Radschnellverbindung Berliner Wasserwege",
      description: `*Lorem ipsum dolor sit amet*, consetetur sadipscing elitr.

Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.`,
      logoSrc: "rsv8-logo.png",
      partnerLogoSrcs: ["rsv8-logo.png", "test.png"],
      exportEnabled: true,
      aiEnabled: false,
      landAcquisitionModuleEnabled: false,
      showLogEntries: false,
      evaluationsEnabled: false,
      alkisStateKey: StateKeyEnum.DISABLED,
      subsubsectionExtraFieldDefinitions: [],
    },
    {
      slug: "rs3000",
      subTitle: "Radschnellverbindung 3000",
      description: null,
      logoSrc: null,
      partnerLogoSrcs: [],
      exportEnabled: false,
      aiEnabled: false,
      landAcquisitionModuleEnabled: false,
      showLogEntries: false,
      evaluationsEnabled: false,
      alkisStateKey: StateKeyEnum.DISABLED,
      subsubsectionExtraFieldDefinitions: [],
    },
    {
      slug: "rs0v1",
      subTitle: "Radschnellverbindung No Section",
      description: null,
      logoSrc: null,
      partnerLogoSrcs: [],
      exportEnabled: false,
      aiEnabled: false,
      landAcquisitionModuleEnabled: false,
      showLogEntries: false,
      evaluationsEnabled: false,
      alkisStateKey: StateKeyEnum.DISABLED,
      subsubsectionExtraFieldDefinitions: [],
    },
    {
      slug: "rs0v2",
      subTitle: "Radschnellverbindung No Subsection",
      description: null,
      logoSrc: null,
      partnerLogoSrcs: [],
      exportEnabled: false,
      aiEnabled: false,
      landAcquisitionModuleEnabled: false,
      showLogEntries: false,
      evaluationsEnabled: false,
      alkisStateKey: StateKeyEnum.DISABLED,
      subsubsectionExtraFieldDefinitions: [],
    },
    {
      slug: "rsv-d",
      subTitle: "Radschnellverbindungen.info – Demo-Strecken",
      description:
        "Seed project for the public radschnellverbindungen-info-feedback survey. Export enabled so /api/projects/rsv-d.json serves Planungsabschnitte.",
      logoSrc: null,
      partnerLogoSrcs: [],
      exportEnabled: true,
      aiEnabled: false,
      landAcquisitionModuleEnabled: false,
      showLogEntries: false,
      evaluationsEnabled: false,
      alkisStateKey: StateKeyEnum.DISABLED,
    },
    ...alkisLandAcquisitionDemoProjects(),
  ]

  for (const data of seedData) {
    await db.project.create({ data })
  }
}

export default seedProjects
