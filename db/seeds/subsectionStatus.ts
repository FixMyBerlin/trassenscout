import db, { SubsectionStatus, SubsectionStatusStyleEnum } from "../index"

const seedSubsectionStatus = async () => {
  const seedFiles: Omit<SubsectionStatus, "id" | "createdAt" | "updatedAt">[] = [
    { projectId: 1, slug: "open", title: "Status offen", style: SubsectionStatusStyleEnum.REGULAR },
    {
      projectId: 1,
      slug: "planning",
      title: "in Planung",
      style: SubsectionStatusStyleEnum.REGULAR,
    },
    {
      projectId: 1,
      slug: "inProgress",
      title: "in Umsetzung",
      style: SubsectionStatusStyleEnum.REGULAR,
    },
    {
      projectId: 1,
      slug: "done",
      title: "abgeschlossen",
      style: SubsectionStatusStyleEnum.REGULAR,
    },
    { projectId: 1, slug: "onHold", title: "pausiert", style: SubsectionStatusStyleEnum.DASHED },
    {
      projectId: 1,
      slug: "trassenverlauf-ungeklaert",
      title: "Trassenverlauf ungeklärt",
      style: SubsectionStatusStyleEnum.DASHED,
    },
  ]

  for (const data of seedFiles) {
    await db.subsectionStatus.create({ data })
  }
}

export default seedSubsectionStatus
