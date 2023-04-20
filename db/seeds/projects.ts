import db, { Project } from "../index"

const seedProjects = async () => {
  const seeData: Omit<Project, "id" | "createdAt" | "updatedAt">[] = [
    {
      slug: "rs-spree",
      title: "Radschnellverbindung Berliner Wasserwege",
      shortTitle: "RS Spree",
      description: `*Lorem ipsum dolor sit amet*, consetetur sadipscing elitr.

Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.`,
      managerId: 1,
      logoSrc: "rsv8-logo.png",
      partnerLogoSrcs: [],
    },
    {
      slug: "rs3000",
      title: "Radschnellverbindung 3000",
      shortTitle: "RS 3000",
      description: null,
      managerId: 2,
      logoSrc: null,
      partnerLogoSrcs: [],
    },
    {
      slug: "rs-blank-section",
      title: "Radschnellverbindung No Section",
      shortTitle: "RS No Section",
      description: null,
      managerId: 2,
      logoSrc: null,
      partnerLogoSrcs: [],
    },
    {
      slug: "rs-blank-subsection",
      title: "Radschnellverbindung No Subsection",
      shortTitle: "RS No Subsection",
      description: null,
      managerId: 2,
      logoSrc: null,
      partnerLogoSrcs: [],
    },
  ]

  for (let i = 0; i < seeData.length; i++) {
    const data = seeData[i]
    if (data) {
      await db.project.create({ data })
    }
  }
}

export default seedProjects
