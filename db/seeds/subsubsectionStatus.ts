import db, { SubsubsectionStatus, SubsubsectionStatusStyleEnum } from "../index"

const seedSubsubsectionStatus = async () => {
  const seedFiles: Omit<SubsubsectionStatus, "id" | "createdAt" | "updatedAt">[] = [
    {
      projectId: 1,
      slug: "open",
      title: "Status offen",
      style: SubsubsectionStatusStyleEnum.REGULAR,
    },
    {
      projectId: 1,
      slug: "irrelevant",
      title: "keine Maßnahme notwendig",
      style: SubsubsectionStatusStyleEnum.GREEN,
    },
    {
      projectId: 1,
      slug: "prePlanning",
      title: "Vorplanung",
      style: SubsubsectionStatusStyleEnum.REGULAR,
    },
    {
      projectId: 1,
      slug: "planning",
      title: "in Planung",
      style: SubsubsectionStatusStyleEnum.REGULAR,
    },
    {
      projectId: 1,
      slug: "inProgress",
      title: "in Umsetzung",
      style: SubsubsectionStatusStyleEnum.REGULAR,
    },
    { projectId: 1, slug: "done", title: "umgesetzt", style: SubsubsectionStatusStyleEnum.REGULAR },
  ]

  for (const data of seedFiles) {
    await db.subsubsectionStatus.create({ data })
  }
}

export default seedSubsubsectionStatus
