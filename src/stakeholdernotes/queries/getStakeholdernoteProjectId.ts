import db from "db"

const getStakeholdernoteProjectId = async (input: Record<string, any>) => {
  return (
    await db.section.findFirstOrThrow({
      where: {
        subsections: {
          some: {
            stakeholdernote: {
              some: { id: input.id || null },
            },
          },
        },
      },
      select: { projectId: true },
    })
  ).projectId
}

export default getStakeholdernoteProjectId
