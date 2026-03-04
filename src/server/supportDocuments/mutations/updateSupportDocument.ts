import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { SupportDocumentFormSchema } from "@/src/server/supportDocuments/schema"
import { z } from "zod"

const UpdateSupportDocumentSchema = SupportDocumentFormSchema.extend({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(UpdateSupportDocumentSchema),
  resolver.authorize("ADMIN"),
  async ({ id, ...data }) => {
    const record = await db.supportDocument.update({
      where: { id },
      data,
    })

    return record
  },
)
