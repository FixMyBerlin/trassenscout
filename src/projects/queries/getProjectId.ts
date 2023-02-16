import db from "db"
import { NotFoundError } from "blitz"

export default async function getProjectId(projectSlug: string) {
  const project = await db.project.findFirst({
    where: {
      slug: projectSlug,
    },
    select: {
      id: true,
    },
  })
  if (!project) throw new NotFoundError()
  return project.id
}
