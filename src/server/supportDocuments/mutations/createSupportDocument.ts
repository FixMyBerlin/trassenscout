import db from "@/db"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const CreateSupportDocumentSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  order: z.number().int().optional(),
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
        title: input.title,
        description: input.description ?? null,
        ...(input.order !== undefined && { order: input.order }),
        createdById: currentUserId,
        upload: {
          create: {
            title: input.title,
            externalUrl: input.externalUrl,
            mimeType: input.mimeType ?? null,
            fileSize: input.fileSize ?? null,
            createdById: currentUserId,
            projectId: null,
          },
        },
      },
    })

    return record
  },
)
