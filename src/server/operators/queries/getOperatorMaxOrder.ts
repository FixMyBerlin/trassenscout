import db from "@/db"

const getOperatorMaxOrder = async (projectSlug: string) => {
  const maxOrder = await db.operator.aggregate({
    _max: {
      order: true,
    },
    where: {
      project: {
        slug: projectSlug,
      },
    },
  })

  return maxOrder._max.order
}

export default getOperatorMaxOrder
