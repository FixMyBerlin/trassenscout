import db from "db"

const getSubsectionProjectId = async (value: number | Record<string, any>) => {
  let subsectionId = null

  if (typeof value === "number") {
    subsectionId = value
  } else if ("subsectionId" in value) {
    subsectionId = value.subsectionId
  } else if ("id" in value) {
    subsectionId = value.id
  }

  const subsection = await db.subsection.findFirstOrThrow({
    where: { id: subsectionId },
    select: { projectId: true },
  })

  return subsection.projectId
}

export default getSubsectionProjectId
