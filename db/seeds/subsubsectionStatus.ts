import db, { StatusStyleEnum, SubsubsectionStatus } from "../index"

const seedSubsubsectionStatus = async () => {
  const seedFiles: Omit<SubsubsectionStatus, "id" | "createdAt" | "updatedAt">[] = [
    { projectId: 1, slug: "open", title: "Status offen", style: StatusStyleEnum.REGULAR },
    {
      projectId: 1,
      slug: "irrelevant",
      title: "keine Maßnahme notwendig",
      style: StatusStyleEnum.DASHED,
    },
    { projectId: 1, slug: "prePlanning", title: "Vorplanung", style: StatusStyleEnum.REGULAR },
    { projectId: 1, slug: "planning", title: "in Planung", style: StatusStyleEnum.REGULAR },
    { projectId: 1, slug: "inProgress", title: "in Umsetzung", style: StatusStyleEnum.REGULAR },
    { projectId: 1, slug: "done", title: "umgesetzt", style: StatusStyleEnum.REGULAR },
  ]

  for (const data of seedFiles) {
    await db.subsubsectionStatus.create({ data })
  }
}

export default seedSubsubsectionStatus
