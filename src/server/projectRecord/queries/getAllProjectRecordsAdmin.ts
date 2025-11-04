import { resolver } from "@blitzjs/rpc"
import { ProjectRecordReviewState } from "@prisma/client"
import db from "db"

export default resolver.pipe(resolver.authorize("ADMIN"), async () => {
  const projectRecords = await db.projectRecord.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        select: {
          id: true,
          slug: true,
        },
      },
      projectRecordTopics: true,
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

  // Sort projectRecords by review state first, then by date
  projectRecords.sort((a, b) => {
    const stateOrder = {
      [ProjectRecordReviewState.NEEDSADMINREVIEW]: 0,
      [ProjectRecordReviewState.NEEDSREVIEW]: 1,
      [ProjectRecordReviewState.REJECTED]: 2,
      [ProjectRecordReviewState.APPROVED]: 3,
    }

    if (stateOrder[a.reviewState] !== stateOrder[b.reviewState]) {
      return stateOrder[a.reviewState] - stateOrder[b.reviewState]
    }

    return a.date && b.date && a.date < b.date ? 1 : -1
  })

  return projectRecords
})

export type AdminProjectRecordWithRelations = NonNullable<
  Awaited<ReturnType<typeof import("./getAllProjectRecordsAdmin").default>>
>[0]
