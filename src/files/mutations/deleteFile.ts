import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getFileProjectId from "../queries/getFileProjectId"

import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getConfig } from "src/core/lib/next-s3-upload/src/utils/config"

const DeleteFileSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteFileSchema),
  authorizeProjectAdmin(getFileProjectId),
  async ({ id }) => {
    const file = await db.file.findFirstOrThrow({ where: { id } })
    const { hostname, pathname } = new URL(file.externalUrl)
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
  async ({ id }) => await db.file.deleteMany({ where: { id } })
)
