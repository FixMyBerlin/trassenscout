import db from "@/db"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const CreateSupportDocumentSchema = z.object({
  title: z.string().min(1),
  externalUrl: z.string().url(),
  mimeType: z.string().nullable().optional(),
  fileSize: z.number().int().positive().nullable().optional(),
})

export default resolver.pipe(
  resolver.zod(CreateSupportDocumentSchema),
  resolver.authorize("ADMIN"),
  async (input, ctx: Ctx) => {
    const currentUserId = ctx.session.userId

    const record = await db.supportDocument.create({
      data: {
        ...input,
        createdById: currentUserId,
      },
    })

    return record
  },
)
