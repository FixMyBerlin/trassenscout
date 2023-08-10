import db, { Topic } from "../index"

const seedTopics = async () => {
  const seedTopics: Omit<Topic, "id" | "createdAt" | "updatedAt">[] = [
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
      await db.topic.create({ data })
    }
  }
}

export default seedTopics
