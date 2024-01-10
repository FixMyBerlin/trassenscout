import db, { Prisma } from "../index"

const seedSubsubsectionSpecial = async () => {
  const seedFiles: Prisma.SubsubsectionSpecialUncheckedCreateInput[] = [
    { projectId: 1, slug: "b1", title: "Besonderheit 1" },
    { projectId: 1, slug: "b2", title: "Besonderheit 2" },
    { projectId: 1, slug: "b3", title: "Besonderheit 3" },
  ]

  for (let i = 0; i < seedFiles.length; i++) {
    const data = seedFiles[i]
    if (data) {
      await db.subsubsectionSpecial.create({ data })
    }
  }
}

export default seedSubsubsectionSpecial
