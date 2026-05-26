import db from "@/db"
import { resolver } from "@blitzjs/rpc"

export default resolver.pipe(resolver.authorize("ADMIN"), async () => {
  return await db.projectRecordTemplate.findMany({
    orderBy: [{ templateTitle: "asc" }, { id: "asc" }],
    include: {
      projects: {
        select: { id: true, slug: true },
        orderBy: { slug: "asc" },
      },
    },
  })
})
