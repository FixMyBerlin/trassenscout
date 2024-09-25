import db, { Operator } from "../index"

const seedOperators = async () => {
  const seedFiles: Omit<Operator, "id" | "createdAt" | "updatedAt">[] = [
    {
      projectId: 1,
      slug: "ban",
      title: "Bezirk Nord",
    },
    {
      projectId: 1,
      slug: "bas",
      title: "Bezirk Süd",
    },
  ]

  for (const data of seedFiles) {
    await db.operator.create({ data })
  }
}

export default seedOperators
