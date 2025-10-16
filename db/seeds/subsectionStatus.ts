import db, { StatusStyleEnum, SubsectionStatus } from "../index"

const seedSubsectionStatus = async () => {
  const seedFiles: Omit<SubsectionStatus, "id" | "createdAt" | "updatedAt">[] = [
    { projectId: 1, slug: "open", title: "Status offen", style: StatusStyleEnum.REGULAR },
    { projectId: 1, slug: "planning", title: "in Planung", style: StatusStyleEnum.REGULAR },
    { projectId: 1, slug: "inProgress", title: "in Umsetzung", style: StatusStyleEnum.REGULAR },
    { projectId: 1, slug: "done", title: "abgeschlossen", style: StatusStyleEnum.REGULAR },
    { projectId: 1, slug: "onHold", title: "pausiert", style: StatusStyleEnum.DASHED },
  ]

  for (const data of seedFiles) {
    await db.subsectionStatus.create({ data })
  }
}

export default seedSubsectionStatus
