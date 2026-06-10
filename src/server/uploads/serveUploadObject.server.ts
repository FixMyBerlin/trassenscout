import { getObject } from "@better-upload/server/helpers"
import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug.server"
import { S3_BUCKET } from "@/src/shared/uploads/config"
import { getS3KeyFromUrl } from "@/src/shared/uploads/url"
import { getConfiguredS3Client } from "./_utils/s3Client.server"

const ParamsSchema = z.object({
  projectSlug: z.string(),
  uploadId: z.coerce.number().int().positive(),
})

export async function serveProjectUploadObject(
  headers: Headers,
  params: { projectSlug: string; uploadId: string },
) {
  await endpointAuth.projectMember({ headers, projectSlug: params.projectSlug, roles: viewerRoles })

  const parseResult = ParamsSchema.safeParse(params)
  if (!parseResult.success) {
    return new Response("Invalid request parameters", { status: 400 })
  }

  const { projectSlug, uploadId } = parseResult.data

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
}
