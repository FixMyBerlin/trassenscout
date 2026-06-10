import { Prisma } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"

const seedSubsubsectionSpecial = async () => {
  const seedFiles: Prisma.SubsubsectionSpecialUncheckedCreateInput[] = [
    { projectId: 1, slug: "b1", title: "Besonderheit 1" },
    { projectId: 1, slug: "b2", title: "Besonderheit 2" },
    { projectId: 1, slug: "b3", title: "Besonderheit 3" },
  ]

  for (const data of seedFiles) {
    await db.subsubsectionSpecial.create({ data })
  }
}

export default seedSubsubsectionSpecial
