import db from "db"

const getSubsubsectionProjectId = async (input: Record<string, any>) => {
  const subsubsectionId = input.id
  return (
    await db.section.findFirstOrThrow({
      where: {
        subsections: { some: { subsubsections: { some: { id: subsubsectionId || null } } } },
      },
      select: { projectId: true },
    })
  ).projectId
}

export default getSubsubsectionProjectId
