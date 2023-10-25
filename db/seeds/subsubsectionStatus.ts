import db, { SubsubsectionStatus } from "../index"

const seedSubsubsectionStatus = async () => {
  const seedFiles: Omit<SubsubsectionStatus, "id" | "createdAt" | "updatedAt">[] = [
    { projectId: 1, slug: "open", title: "Status offen" },
    { projectId: 1, slug: "irrelevant", title: "keine Maßnahme notwendig" },
    { projectId: 1, slug: "prePlanning", title: "Vorplanung" },
    { projectId: 1, slug: "planning", title: "in Planung" },
    { projectId: 1, slug: "inProgress", title: "in Umsetzung" },
    { projectId: 1, slug: "done", title: "umgesetzt" },
  ]

  for (let i = 0; i < seedFiles.length; i++) {
    const data = seedFiles[i]
    if (data) {
      await db.subsubsectionStatus.create({ data })
    }
  }
}

export default seedSubsubsectionStatus
