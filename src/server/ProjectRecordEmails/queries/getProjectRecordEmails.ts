import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(resolver.authorize("ADMIN"), async () => {
  const projectRecordEmails = await db.projectRecordEmail.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        select: {
          id: true,
          slug: true,
        },
      },
      projectRecords: {
        select: {
          id: true,
          title: true,
        },
      },
      uploads: {
        orderBy: { id: "desc" },
        select: {
          id: true,
          title: true,
          externalUrl: true,
        },
      },
    },
  })

  return projectRecordEmails
})

export type ProjectRecordEmailWithRelations = NonNullable<
  Awaited<ReturnType<typeof import("./getProjectRecordEmails").default>>
>[0]
