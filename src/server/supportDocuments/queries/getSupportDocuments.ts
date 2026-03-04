import db from "@/db"
import { resolver } from "@blitzjs/rpc"

export default resolver.pipe(resolver.authorize(/* logged in is enough */), async () => {
  const documents = await db.supportDocument.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      order: true,
      createdAt: true,
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      upload: {
        select: {
          id: true,
          externalUrl: true,
          mimeType: true,
          fileSize: true,
        },
      },
    },
  })

  return documents
})
