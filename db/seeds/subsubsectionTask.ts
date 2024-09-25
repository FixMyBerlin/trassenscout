import db, { Prisma } from "../index"

const seedSubsubsectionTask = async () => {
  const seedFiles: Prisma.SubsubsectionTaskUncheckedCreateInput[] = [
    { projectId: 1, slug: "footway", title: "Ausbau Fußweg" },
    { projectId: 1, slug: "marking", title: "Fahrbahnmarkierung" },
    { projectId: 1, slug: "conversion", title: "Vollumbau" },
  ]

  for (const data of seedFiles) {
    await db.subsubsectionTask.create({ data })
  }
}

export default seedSubsubsectionTask
