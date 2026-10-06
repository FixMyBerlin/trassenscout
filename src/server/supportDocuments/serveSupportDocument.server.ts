import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { getS3Object } from "@/src/server/uploads/_utils/getS3Object.server"
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

  const object = await getS3Object(getS3KeyFromUrl(document.upload.externalUrl))

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
