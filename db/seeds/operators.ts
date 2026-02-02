import db, { Operator } from "../index"

const seedOperators = async () => {
  const seedFiles: Omit<Operator, "id" | "createdAt" | "updatedAt">[] = [
    {
      projectId: 1,
      slug: "ban",
      title: "Bezirk Nord",
      order: 1,
    },
    {
      projectId: 1,
      slug: "bas",
      title: "Bezirk Süd",
      order: 2,
    },
  ]

  for (const data of seedFiles) {
    await db.operator.create({ data })
  }
}

export default seedOperators
