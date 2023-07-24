import db, { Survey } from "../index"

const seedSurvey = async () => {
  const seedSurvey: Omit<Survey, "id" | "createdAt" | "updatedAt">[] = [
    {
      projectId: 1,
      slug: "rs8",
      active: true,
    },
    {
      projectId: 1,
      slug: "rs8-inactive",
      active: false,
    },
  ]

  for (let i = 0; i < seedSurvey.length; i++) {
    const data = seedSurvey[i]
    if (data) {
      await db.survey.create({ data })
    }
  }
}

export default seedSurvey
