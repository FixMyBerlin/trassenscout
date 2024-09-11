import db, { QualityLevel } from "../index"

const seedQualityLevels = async () => {
  const seedFiles: Omit<QualityLevel, "id" | "createdAt" | "updatedAt">[] = [
    { projectId: 1, slug: "rsv", title: "Radschnellverbindung" },
    { projectId: 1, slug: "rvr", title: "Radvorrangroute" },
    { projectId: 1, slug: "rnbw", title: "RadNETZ BW Standard" },
    { projectId: 1, slug: "no", title: "kein Standard" },
  ]

  for (const data of seedFiles) {
    await db.qualityLevel.create({ data })
  }
}

export default seedQualityLevels
