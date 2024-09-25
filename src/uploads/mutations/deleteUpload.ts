import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { getConfig } from "@/src/core/lib/next-s3-upload/src/utils/config"
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"
import getUploadProjectId from "../queries/getUploadProjectId"

const DeleteUploadSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteUploadSchema),
  authorizeProjectAdmin(getUploadProjectId),
  async ({ id }) => {
    const upload = await db.upload.findFirstOrThrow({ where: { id } })
    const { hostname, pathname } = new URL(upload.externalUrl)
    const isAws = hostname.endsWith("amazonaws.com")
    if (!isAws) throw new NotFoundError()

    const { accessKeyId, secretAccessKey, region } = getConfig()
    const s3Client = new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      region,
    })
    const command = new DeleteObjectCommand({
      Bucket: hostname.split(".")[0],
      Key: pathname.substring(1),
    })
    await s3Client.send(command)

    return { id }
  },
  async ({ id }) => await db.upload.deleteMany({ where: { id } }),
)
