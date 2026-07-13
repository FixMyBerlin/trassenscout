import { getObject } from "@better-upload/server/helpers"
import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/s3Client.server"
import { S3_BUCKET } from "@/src/shared/uploads/config"
import { getUploadServeHeaders } from "@/src/shared/uploads/serveHeaders"
import { getS3KeyFromUrl } from "@/src/shared/uploads/url"

const ParamsSchema = z.object({
  documentId: z.coerce.number().int().positive(),
})

export async function serveSupportDocumentObject(headers: Headers, params: { documentId: string }) {
  await endpointAuth.session(headers)

  const parseResult = ParamsSchema.safeParse(params)
  if (!parseResult.success) {
    return new Response("Invalid request parameters", { status: 400 })
  }

  const { documentId } = parseResult.data

  const document = await db.supportDocument.findFirst({
    where: {
      id: documentId,
    },
    select: {
      upload: {
        select: {
          externalUrl: true,
        },
      },
    },
  })

  if (!document?.upload) {
    return new Response("Not Found", { status: 404 })
  }

  const key = getS3KeyFromUrl(document.upload.externalUrl)
  const s3Client = getConfiguredS3Client()

  const object = await getObject(s3Client, {
    bucket: S3_BUCKET,
    key,
  })

  return new Response(object.blob, {
    headers: {
      "Content-Type": object.contentType,
      "Content-Length": String(object.contentLength),
      ETag: object.eTag,
      "Cache-Control": "no-cache",
      ...getUploadServeHeaders(object.contentType),
    },
  })
}
