import db from "@/db"
import { withAuth } from "@/src/app/api/(auth)/_utils/withAuth"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET } from "@/src/server/uploads/_utils/config"
import { getS3KeyFromUrl } from "@/src/server/uploads/_utils/url"
import { getObject } from "@better-upload/server/helpers"
import { z } from "zod"

const ParamsSchema = z.object({
  documentId: z.coerce.number().int().positive(),
  rest: z.array(z.string()).optional(),
})

export const GET = withAuth(async ({ params }) => {
  try {
    const parseResult = ParamsSchema.safeParse(params)
    if (!parseResult.success) {
      return new Response("Invalid request parameters", { status: 400 })
    }
    const { documentId } = parseResult.data

    // Fetch support document
    const document = await db.supportDocument.findFirst({
      where: {
        id: documentId,
      },
      select: {
        externalUrl: true,
      },
    })

    if (!document) {
      return new Response("Not Found", { status: 404 })
    }

    const key = getS3KeyFromUrl(document.externalUrl)
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
      },
    })
  } catch (error) {
    console.error("Error downloading support document:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
})
