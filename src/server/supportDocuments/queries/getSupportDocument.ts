import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"

const GetSupportDocumentSchema = z.object({ id: z.number() })

export default resolver.pipe(
  resolver.zod(GetSupportDocumentSchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const document = await db.supportDocument.findFirst({
      where: { id },
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

    if (!document) throw new NotFoundError("Support document not found")

    return document
  },
)
