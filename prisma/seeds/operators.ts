import { Operator } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"

const seedOperators = async () => {
  const projects = await db.project.findMany()
  const rs3000Project = projects.find((p) => p.slug === "rs3000")

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

  // Add operator for RS3000
  if (rs3000Project) {
    seedFiles.push({
      projectId: rs3000Project.id,
      slug: "rs3000-operator",
      title: "RS3000 Operator",
      order: 1,
    })
  }

  for (const data of seedFiles) {
    await db.operator.create({ data })
  }
}

export default seedOperators
