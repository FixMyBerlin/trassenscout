import db from "db"

export const getProjectIdFromSlug = async (projectSlug: string) => {
  const project = await db.project.findFirst({
    where: { slug: projectSlug },
    select: { id: true },
  })

  if (!project) {
    throw new Error(`Project with slug "${projectSlug}" not found`)
  }

  return project.id
}
