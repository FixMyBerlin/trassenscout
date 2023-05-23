import db from "db"

const getSubsectionProjectId = async (value: number | Record<string, any>) => {
  let subsectionId
  if (typeof value === "number") {
    subsectionId = value
  } else if ("subsectionId" in value) {
    subsectionId = value.subsectionId
  } else if ("id" in value) {
    subsectionId = value.id
  }
  return (
    await db.section.findFirstOrThrow({
      where: { subsections: { some: { id: subsectionId || null } } },
      select: { projectId: true },
    })
  ).projectId
}

export default getSubsectionProjectId
