import db from "@/db"
import { resolver } from "@blitzjs/rpc"

export default resolver.pipe(resolver.authorize("ADMIN"), async () => {
  const projectRecordTopics = await db.projectRecordTopic.findMany({
    select: {
      id: true,
      title: true,
      projectId: true,
      project: {
        select: {
          slug: true,
        },
      },
    },
    orderBy: [{ projectId: "asc" }, { title: "asc" }],
  })

  return { projectRecordTopics }
})
