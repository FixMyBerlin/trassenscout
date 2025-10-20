import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetProtocolAdmin = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(GetProtocolAdmin),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const protocol = await db.protocol.findFirst({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            slug: true,
          },
        },
        protocolTopics: true,
        subsection: true,
        uploads: {
          select: {
            id: true,
            title: true,
            externalUrl: true,
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
      },
    })

    if (!protocol) throw new NotFoundError()

    return protocol
  },
)
