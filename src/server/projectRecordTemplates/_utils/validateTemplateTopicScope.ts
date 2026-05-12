import db from "@/db"

export const validateTemplateTopicScope = async ({
  projectIds,
  projectRecordTopicIds,
}: {
  projectIds: number[]
  projectRecordTopicIds: number[]
}) => {
  if (!projectRecordTopicIds.length) return

  const topics = await db.projectRecordTopic.findMany({
    where: { id: { in: projectRecordTopicIds } },
    select: { id: true, projectId: true },
  })

  if (topics.length !== projectRecordTopicIds.length) {
    throw new Error("Mindestens ein ausgewähltes Tag ist ungültig.")
  }

  const invalidTopic = topics.find((topic) => !projectIds.includes(topic.projectId))
  if (invalidTopic) {
    throw new Error("Ausgewählte Tags müssen zu den ausgewählten Projekten gehören.")
  }
}
