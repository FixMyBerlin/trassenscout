import db from "@/db"

const getSubsectionMaxOrder = async (projectId: number) => {
  const maxOrder = await db.subsection.aggregate({
    _max: {
      order: true,
    },
    where: {
      project: {
        id: projectId,
      },
    },
  })

  return maxOrder._max.order
}

export default getSubsectionMaxOrder
