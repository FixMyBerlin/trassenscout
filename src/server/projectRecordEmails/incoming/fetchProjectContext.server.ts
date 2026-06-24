import db from "@/src/server/db.server"

export async function fetchProjectContext({ projectId }: { projectId: number }) {
  const subsections = await db.subsection.findMany({
    where: { projectId },
    select: {
      id: true,
      slug: true,
      description: true,
    },
    orderBy: { order: "asc" },
  })
  console.log(`Found ${subsections.length} subsections for project ${projectId}`)

  const subsubsections = await db.subsubsection.findMany({
    where: { subsection: { projectId } },
    include: {
      subsection: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  })
  console.log(`Found ${subsubsections.length} subsubsections for project ${projectId}`)

  const projectRecordTopics = await db.projectRecordTopic.findMany({
    where: { projectId },
    select: {
      id: true,
      title: true,
    },
  })
  console.log(`Found ${projectRecordTopics.length} projectRecord topics for project ${projectId}`)

  return {
    subsections,
    subsubsections,
    projectRecordTopics,
  }
}
