import { getObject } from "@better-upload/server/helpers"
import { z } from "zod"
import { isPlaywright } from "@/src/components/core/utils/isEnv"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug.server"
import { S3_BUCKET } from "@/src/shared/uploads/config"
import { getUploadServeHeaders } from "@/src/shared/uploads/serveHeaders"
import { getFilenameFromS3, getS3KeyFromUrl } from "@/src/shared/uploads/url"
import { getConfiguredS3Client } from "./_utils/s3Client.server"

const ParamsSchema = z.object({
  projectSlug: z.string(),
  uploadId: z.coerce.number().int().positive(),
})

const TEST_FIXTURE_JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q=="

function serveTestFixtureImage() {
  const body = Buffer.from(TEST_FIXTURE_JPEG_BASE64, "base64")
  return new Response(body, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(body.byteLength),
      "Cache-Control": "no-cache",
      ...getUploadServeHeaders("image/jpeg"),
    },
  })
}

export async function serveProjectUploadObject(
  headers: Headers,
  params: { projectSlug: string; uploadId: string },
  options: { download?: boolean } = {},
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

  if (isPlaywright) {
    return serveTestFixtureImage()
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
      ...getUploadServeHeaders(object.contentType, {
        forceDownload: options.download,
        filename: getFilenameFromS3(upload.externalUrl),
      }),
    },
  })
}
