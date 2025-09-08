import { resolver } from "@blitzjs/rpc"
import { ProtocolReviewState } from "@prisma/client"
import db from "db"

export default resolver.pipe(resolver.authorize("ADMIN"), async () => {
  const protocols = await db.protocol.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        select: {
          id: true,
          slug: true,
        },
      },
      protocolTopics: true,
      subsection: true,
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  // Sort protocols by review state first, then by date
  protocols.sort((a, b) => {
    const stateOrder = {
      [ProtocolReviewState.NEEDSREVIEW]: 0,
      [ProtocolReviewState.REVIEWED]: 1,
      [ProtocolReviewState.REJECTED]: 2,
      [ProtocolReviewState.APPROVED]: 3,
    }

    if (stateOrder[a.reviewState] !== stateOrder[b.reviewState]) {
      return stateOrder[a.reviewState] - stateOrder[b.reviewState]
    }

    return a.date && b.date && a.date < b.date ? 1 : -1
  })

  return protocols
})

export type AdminProtocolWithRelations = NonNullable<
  Awaited<ReturnType<typeof import("./getAllProtocolsAdmin").default>>
>[0]
