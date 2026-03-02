import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const UpdateSupportDocumentSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
})

export default resolver.pipe(
  resolver.zod(UpdateSupportDocumentSchema),
  resolver.authorize("ADMIN"),
  async ({ id, title }) => {
    const record = await db.supportDocument.update({
      where: { id },
      data: { title },
    })

    return record
  },
)
