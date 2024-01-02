import db, { Prisma } from "../index"

const seedSubsubsectionTask = async () => {
  const seedFiles: Prisma.SubsubsectionTaskUncheckedCreateInput[] = [
    { projectId: 1, slug: "footway", title: "Ausbau Fußweg" },
    { projectId: 1, slug: "marking", title: "Fahrbahnmarkierung" },
    { projectId: 1, slug: "conversion", title: "Vollumbau" },
  ]

  for (let i = 0; i < seedFiles.length; i++) {
    const data = seedFiles[i]
    if (data) {
      await db.subsubsectionTask.create({ data })
    }
  }
}

export default seedSubsubsectionTask
