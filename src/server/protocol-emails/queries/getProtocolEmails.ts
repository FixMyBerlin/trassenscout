import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(resolver.authorize("ADMIN"), async () => {
  const protocolEmails = await db.protocolEmail.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      protocols: {
        select: {
          id: true,
          title: true,
        },
      },
      uploads: {
        select: {
          id: true,
          title: true,
          externalUrl: true,
        },
      },
    },
  })

  return protocolEmails
})

export type ProtocolEmailWithRelations = NonNullable<
  Awaited<ReturnType<typeof import("./getProtocolEmails").default>>
>[0]
