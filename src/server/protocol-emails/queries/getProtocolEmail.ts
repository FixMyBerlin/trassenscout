import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetProtocolEmail = z.object({
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetProtocolEmail),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const protocolEmail = await db.protocolEmail.findFirst({
      where: { id },
      include: {
        protocols: {
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

    if (!protocolEmail) throw new NotFoundError()

    return protocolEmail
  },
)
