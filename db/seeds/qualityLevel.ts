import db, { QualityLevel } from "../index"

const seedQualityLevel = async () => {
  const seedFiles: Omit<QualityLevel, "id" | "createdAt" | "updatedAt">[] = [
    { projectId: 1, slug: "rsv", title: "Radschnellverbindung" },
    { projectId: 1, slug: "rvr", title: "Radvorrangroute" },
    { projectId: 1, slug: "rnbw", title: "RadNETZ BW Standard" },
    { projectId: 1, slug: "no", title: "kein Standard" },
  ]

  for (let i = 0; i < seedFiles.length; i++) {
    const data = seedFiles[i]
    if (data) {
      await db.operator.create({ data })
    }
  }
}

export default seedQualityLevel
