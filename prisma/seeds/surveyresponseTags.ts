import { SurveyResponseTag } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"

const seedSurveyResponseTags = async () => {
  const seedTags: Omit<SurveyResponseTag, "id">[] = [
    {
      title: "Grünflächen",
      projectId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      archivedAt: null,
    },
    {
      title: "Spielende Kinder",
      projectId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      archivedAt: null,
    },
    {
      title: "Einkaufen",
      projectId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      archivedAt: null,
    },
    {
      title: "Geschwindigkeit",
      projectId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      archivedAt: null,
    },
    {
      title: "Wegführung",
      projectId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      archivedAt: null,
    },
  ]

  for (const data of seedTags) {
    await db.surveyResponseTag.create({ data })
  }
}

export default seedSurveyResponseTags
