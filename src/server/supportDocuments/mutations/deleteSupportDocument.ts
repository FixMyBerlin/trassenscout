import db from "@/db"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET } from "@/src/server/uploads/_utils/config"
import { getS3KeyFromUrl } from "@/src/server/uploads/_utils/url"
import { deleteObject } from "@better-upload/server/helpers"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"

// equivalent to deleteUploadFileAndDbRecord in uploads/mutations/deleteUpload.ts

const DeleteSupportDocumentSchema = z.object({ id: z.number() })

async function deleteSupportDocumentFile(id: number): Promise<void> {
  const document = await db.supportDocument.findFirstOrThrow({
    where: { id },
    select: {
      id: true,
      externalUrl: true,
    },
  })

  const key = getS3KeyFromUrl(document.externalUrl)
  const rootFolder = process.env.S3_UPLOAD_ROOTFOLDER

  // Security: Only allow deletion of files in the current environment's root folder
  if (!key.startsWith(rootFolder)) {
    throw new NotFoundError(
      `File does not belong to current environment (expected root folder: ${rootFolder})`,
    )
  }

  // Delete from S3 (fail-fast: if this fails, we don't delete the DB record)
  const s3 = getConfiguredS3Client()
  await deleteObject(s3, { bucket: S3_BUCKET, key })

  // Delete DB record
  await db.supportDocument.deleteMany({ where: { id: document.id } })
}

export default resolver.pipe(
  resolver.zod(DeleteSupportDocumentSchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    await deleteSupportDocumentFile(id)
    return { id }
  },
)
