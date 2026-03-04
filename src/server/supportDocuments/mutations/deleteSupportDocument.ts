import db from "@/db"
import { deleteUploadFileAndDbRecord } from "@/src/server/uploads/_utils/deleteUploadFileAndDbRecord"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"

const DeleteSupportDocumentSchema = z.object({ id: z.number() })

export default resolver.pipe(
  resolver.zod(DeleteSupportDocumentSchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const document = await db.supportDocument.findFirst({
      where: { id },
      include: {
        upload: {
          select: {
            id: true,
            externalUrl: true,
            collaborationUrl: true,
            collaborationPath: true,
          },
        },
      },
    })

    if (!document) {
      throw new NotFoundError("Support document not found")
    }

    // Delete the upload file (S3 + LuckyCloud + Upload DB record) if it exists
    if (document.upload) {
      await deleteUploadFileAndDbRecord(document.upload)
    }

    // Delete the SupportDocument record
    await db.supportDocument.deleteMany({ where: { id } })

    return { id }
  },
)
