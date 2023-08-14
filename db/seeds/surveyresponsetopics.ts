import db, { SurveyResponseTopic } from "../index"

const seedSurveyResponseTopics = async () => {
  const seedTopics: Omit<SurveyResponseTopic, "id" | "createdAt" | "updatedAt">[] = [
    {
      title: "Grünflächen",
      projectId: 1,
    },
    {
      title: "Spielende Kinder",
      projectId: 1,
    },
    {
      title: "Einkaufen",
      projectId: 1,
    },
    {
      title: "Geschwindigkeit",
      projectId: 1,
    },
    {
      title: "Wegführung",
      projectId: 1,
    },
  ]

  for (let i = 0; i < seedTopics.length; i++) {
    const data = seedTopics[i]
    if (data) {
      await db.surveyResponseTopic.create({ data })
    }
  }
}

export default seedSurveyResponseTopics
