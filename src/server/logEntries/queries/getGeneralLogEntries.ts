import db from "@/db"
import { resolver } from "@blitzjs/rpc"

export default resolver.pipe(resolver.authorize("ADMIN"), async () => {
  const logEntries = await db.logEntry.findMany({
    where: { projectId: null },
    orderBy: { id: "desc" },
    take: 50,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  return { logEntries }
})
