import db, { Project } from "../index"

const seedProjects = async () => {
  const seedData: Omit<Project, "id" | "createdAt" | "updatedAt">[] = [
    {
      slug: "rs23", // "W" ist der 23. Buchstabe
      subTitle: "Radschnellverbindung Berliner Wasserwege",
      description: `*Lorem ipsum dolor sit amet*, consetetur sadipscing elitr.

Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.`,
      managerId: null,
      logoSrc: "rsv8-logo.png",
      felt_subsection_geometry_source_url: null,
      partnerLogoSrcs: ["rsv8-logo.png", "test.png"],
    },
    {
      slug: "rs3000",
      subTitle: "Radschnellverbindung 3000",
      description: null,
      managerId: null,
      logoSrc: null,
      felt_subsection_geometry_source_url: null,
      partnerLogoSrcs: [],
    },
    {
      slug: "rs0v1",
      subTitle: "Radschnellverbindung No Section",
      description: null,
      managerId: null,
      logoSrc: null,
      felt_subsection_geometry_source_url: null,
      partnerLogoSrcs: [],
    },
    {
      slug: "rs0v2",
      subTitle: "Radschnellverbindung No Subsection",
      description: null,
      managerId: null,
      logoSrc: null,
      felt_subsection_geometry_source_url: null,
      partnerLogoSrcs: [],
    },
  ]

  for (const data of seedData) {
    await db.project.create({ data })
  }
}

export default seedProjects
