import { getConfiguredS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET, S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES } from "@/src/server/uploads/_utils/config"
import { sanitizeKey } from "@/src/server/uploads/_utils/keys"
import { uploadSource } from "@/src/server/uploads/_utils/sources"
import { route, Router } from "@better-upload/server"
import { v4 as uuidv4 } from "uuid"

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
export function createUploadRouter(options: CreateUploadRouterOptions): Router {
  const { keyPrefix, userId, onBeforeUpload } = options
  const s3Client = getConfiguredS3Client()
  const rootFolder = process.env.S3_UPLOAD_ROOTFOLDER

  function generateS3Key(filename: string): string {
    const sanitizedFilename = sanitizeKey(filename)
    return `${rootFolder}/${keyPrefix}/${uuidv4()}/${sanitizedFilename}` as const
  }

  return {
    client: s3Client,
    bucketName: S3_BUCKET,
    routes: {
      upload: route({
        multipleFiles: true,
        maxFileSize: S3_MAX_FILE_SIZE_BYTES,
        maxFiles: S3_MAX_FILES,
        onBeforeUpload: async ({ req, files, clientMetadata }) => {
          if (onBeforeUpload) {
            await onBeforeUpload(files)
          }

          return {
            generateObjectInfo: ({ file }) => {
              const key = generateS3Key(file.name)
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
