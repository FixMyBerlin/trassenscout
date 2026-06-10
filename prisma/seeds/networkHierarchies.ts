import { NetworkHierarchy } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"

const seedNetworkHierarchies = async () => {
  const projects = await db.project.findMany()
  const rs3000Project = projects.find((project) => project.slug === "rs3000")

  const seedFiles: Omit<NetworkHierarchy, "id" | "createdAt" | "updatedAt">[] = [
    {
      projectId: 1,
      slug: "basis",
      title: "Basisnetz",
    },
  ]

  if (rs3000Project) {
    seedFiles.push({
      projectId: rs3000Project.id,
      slug: "rs3000-basis",
      title: "RS3000 Basisnetz",
    })
  }

  for (const data of seedFiles) {
    await db.networkHierarchy.create({ data })
  }
}

export default seedNetworkHierarchies
