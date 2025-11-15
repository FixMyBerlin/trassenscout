import db from "@/db"
import { withProjectMembership } from "@/src/app/api/(auth)/_utils/withProjectMembership"
import { viewerRoles } from "@/src/authorization/constants"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET } from "@/src/server/uploads/_utils/config"
import { getS3KeyFromUrl } from "@/src/server/uploads/_utils/url"
import { getObject } from "@better-upload/server/helpers"
import { z } from "zod"

const ParamsSchema = z.object({
  projectSlug: z.string(),
  uploadId: z.coerce.number().int().positive(),
})

export const GET = withProjectMembership(viewerRoles, async ({ params }) => {
  try {
    const parseResult = ParamsSchema.safeParse(params)
    if (!parseResult.success) {
      return new Response("Invalid request parameters", { status: 400 })
    }
    const { projectSlug, uploadId } = parseResult.data

    // Fetch upload and verify it belongs to the project
    // (`withProjectMembership` already verified user has access to the project)
    const projectId = await getProjectIdBySlug(projectSlug)
    const upload = await db.upload.findFirst({
      where: {
        id: uploadId,
        projectId,
      },
      select: {
        externalUrl: true,
      },
    })

    if (!upload) {
      return new Response("Not Found", { status: 404 })
    }

    const key = getS3KeyFromUrl(upload.externalUrl)
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
    console.error("Error downloading upload:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
})
