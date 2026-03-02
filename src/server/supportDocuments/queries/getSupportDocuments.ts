import db from "@/db"
import { resolver } from "@blitzjs/rpc"

export default resolver.pipe(async () => {
  const documents = await db.supportDocument.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      externalUrl: true,
      mimeType: true,
      fileSize: true,
      createdAt: true,
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  return documents
})
