import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetProjectRecordEmail = z.object({
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetProjectRecordEmail),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const projectRecordEmail = await db.projectRecordEmail.findFirst({
      where: { id },
      include: {
        projectRecords: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!projectRecordEmail) throw new NotFoundError()

    return projectRecordEmail
  },
)
