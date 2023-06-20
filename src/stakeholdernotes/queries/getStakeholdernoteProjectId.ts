import db from "db"

const getStakeholdernoteProjectId = async (input: Record<string, any>) => {
  const stakeholdernoteId = input.id || null

  const subsection = await db.subsection.findFirstOrThrow({
    where: { stakeholdernotes: { some: { id: stakeholdernoteId } } },
    select: { projectId: true },
  })

  return subsection.projectId
}

export default getStakeholdernoteProjectId
