import { Prisma } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"

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
