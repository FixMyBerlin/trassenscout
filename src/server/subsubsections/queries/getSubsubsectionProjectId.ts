import db from "@/db"

const getSubsubsectionProjectId = async (input: Record<string, any>) => {
  const subsubsectionId = input.id || null

  const subsubsection = await db.subsection.findFirstOrThrow({
    where: { subsubsections: { some: { id: subsubsectionId } } },
    select: { projectId: true },
  })

  return subsubsection.projectId
}

export default getSubsubsectionProjectId
