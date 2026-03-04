import db from "@/db"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { SupportDocumentFormSchema } from "@/src/server/supportDocuments/schema"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const UpdateSupportDocumentSchema = SupportDocumentFormSchema.extend({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(UpdateSupportDocumentSchema),
  resolver.authorize("ADMIN"),
  async ({ id, ...data }, ctx: Ctx) => {
    const previous = await db.supportDocument.findFirst({ where: { id } })

    const record = await db.supportDocument.update({
      where: { id },
      data,
    })

    await createLogEntry({
      action: "UPDATE",
      message: `Support-Dokument "${record.title}" bearbeitet`,
      userId: ctx.session.userId,
      previousRecord: previous,
      updatedRecord: record,
      supportDocumentId: record.id,
    })

    return record
  },
)
