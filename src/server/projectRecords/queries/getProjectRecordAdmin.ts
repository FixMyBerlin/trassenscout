import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetProjectRecordAdmin = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(GetProjectRecordAdmin),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const projectRecord = await db.projectRecord.findFirst({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            slug: true,
            aiEnabled: true,
          },
        },
        projectRecordTopics: true,
        subsection: true,
        subsubsection: {
          include: {
            subsection: {
              select: { slug: true },
            },
          },
        },
        uploads: {
          orderBy: { id: "desc" },
          select: {
            title: true,
            id: true,
          },
        },
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
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        projectRecordEmail: {
          select: {
            id: true,
            textBody: true,
            from: true,
            date: true,
            subject: true,
            uploads: { select: { id: true, title: true } },
          },
        },
      },
    })

    if (!projectRecord) throw new NotFoundError()

    return projectRecord
  },
)
