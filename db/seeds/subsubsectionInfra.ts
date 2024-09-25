import db, { Prisma } from "../index"

const seedSubsubsectionInfra = async () => {
  const seedFiles: Prisma.SubsubsectionInfraUncheckedCreateInput[] = [
    {
      projectId: 1,
      slug: "ff1",
      title: "Eigenständig geführte Radschnellverbindung im Zweirichtungsverkehr",
    },
    {
      projectId: 1,
      slug: "ff2",
      title: "Straßenbegleitende Radschnellverbindung im Zweirichtungsverkehr",
    },
    {
      projectId: 1,
      slug: "ff3",
      title: "Straßenbegleitende Radschnellverbindung im Einrichtungsverkehr",
    },
    {
      projectId: 1,
      slug: "ff4",
      title: "Straßenbegleitende Radschnellverbindung als Radfahrstreifen im Einrichtungsverkehr",
    },
    { projectId: 1, slug: "ff5", title: "Radschnellverbindung als Fahrradstraße" },
  ]

  for (const data of seedFiles) {
    await db.subsubsectionInfra.create({ data })
  }
}

export default seedSubsubsectionInfra
