import { route, Router } from "@better-upload/server"
import db from "@/src/server/db.server"
import { dedupeUploadFilename } from "@/src/server/uploads/_utils/dedupeUploadFilename"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/s3Client.server"
import { uploadSource } from "@/src/server/uploads/_utils/sources"
import {
  S3_BUCKET,
  S3_MAX_FILE_SIZE_BYTES,
  S3_MAX_FILES_PROJECT,
} from "@/src/shared/uploads/config"
import { getFilenameFromS3 } from "@/src/shared/uploads/url"

type CreateUploadRouterOptions = {
  keyPrefix: string
  userId: number
  onBeforeUpload?: (files: { name: string; size: number; type: string }[]) => void | Promise<void>
}

/**
 * Creates a Better Upload router with shared S3 configuration.
 * @param options - Configuration options including keyPrefix (e.g., project slug or "support") and userId
 * @returns A configured Router instance
 */
export function createUploadRouter(options: CreateUploadRouterOptions) {
  const { keyPrefix, userId, onBeforeUpload } = options
  const s3Client = getConfiguredS3Client()
  const rootFolder = process.env.S3_UPLOAD_ROOTFOLDER

  function buildS3Key(sanitizedFilename: string) {
    return `${rootFolder}/${keyPrefix}/${crypto.randomUUID()}/${sanitizedFilename}` as const
  }

  return {
    client: s3Client,
    bucketName: S3_BUCKET,
    routes: {
      upload: route({
        multipleFiles: true,
        maxFileSize: S3_MAX_FILE_SIZE_BYTES,
        maxFiles: S3_MAX_FILES_PROJECT,
        onBeforeUpload: async ({ req: _req, files, clientMetadata: _clientMetadata }) => {
          if (onBeforeUpload) {
            await onBeforeUpload(files)
          }

          const existing = await db.upload.findMany({
            where: { project: { slug: keyPrefix } },
            select: { externalUrl: true },
          })
          const takenLower = new Set(
            existing.map((upload) => getFilenameFromS3(upload.externalUrl).toLowerCase()),
          )

          return {
            generateObjectInfo: ({ file }) => {
              const key = buildS3Key(dedupeUploadFilename(file.name, takenLower))
              return {
                key,
                metadata: {
                  userId: String(userId),
                  source: uploadSource.dropzone,
                },
              }
            },
          }
        },
      }),
    },
  } satisfies Router
}
