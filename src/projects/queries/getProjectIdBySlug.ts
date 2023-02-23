import db from "db"

type Input = string | Record<string, any>

const getProjectIdBySlug = async (projectSlug: Input): Promise<number> => {
  if (typeof projectSlug !== "string") {
    projectSlug = projectSlug.projectSlug
  }
  return (
    await db.project.findFirstOrThrow({
      // @ts-ignore possible error is intended here
      where: { slug: projectSlug || null },
      select: { id: true },
    })
  ).id
}

export default getProjectIdBySlug
