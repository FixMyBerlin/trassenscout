import db from "db"

type Value = number | Record<string, any>

const getSectionProjectId = async (value: Value) => {
  let sectionId
  if (typeof value === "number") {
    sectionId = value
  } else if ("sectionId" in value) {
    sectionId = value.sectionId
  } else if ("id" in value) {
    sectionId = value.id
  }

  return (
    await db.section.findFirstOrThrow({
      where: { id: sectionId || null },
      select: { projectId: true },
    })
  ).projectId
}

export default getSectionProjectId
