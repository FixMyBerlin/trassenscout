import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { streamUploadObject } from "@/src/server/uploads/_utils/streamUploadObject.server"

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

  return streamUploadObject(document.upload.externalUrl)
}
