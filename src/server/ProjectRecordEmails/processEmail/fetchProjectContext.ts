import db from "db"

export const fetchProjectContext = async ({ projectId }: { projectId: number }) => {
  // Fetch subsections for this project
  const subsections = await db.subsection.findMany({
    where: { projectId: projectId },
    select: {
      id: true,
      slug: true,
      start: true,
      end: true,
    },
    orderBy: { order: "asc" },
  })
  console.log(`Found ${subsections.length} subsections for project ${projectId}`)

  // Fetch subsubsections for this project
  // tbd: we might want a pipeline where we first find the matching subsection and then only fetch subsubsections for that subsection
  // tbd: do we want to fetch more data (like Führungsform etc.) to improve matching?
  const subsubsections = await db.subsubsection.findMany({
    where: { subsection: { projectId: projectId } },
    include: { subsection: { select: { id: true, slug: true } } },
  })
  console.log(`Found ${subsubsections.length} subsubsections for project ${projectId}`)

  // Fetch projectRecord topics for this project
  const projectRecordTopics = await db.projectRecordTopic.findMany({
    where: { projectId: projectId },
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
