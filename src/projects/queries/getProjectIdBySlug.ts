import db from "db"

const getProjectIdBySlug = async (projectSlug: string) =>
  (
    await db.project.findFirstOrThrow({
      where: { slug: projectSlug },
      select: { id: true },
    })
  ).id

export default getProjectIdBySlug
