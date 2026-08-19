import { route, Router } from "@better-upload/server"
import { z } from "zod"
import db from "@/src/server/db.server"
import { getProjectUploadS3KeyPrefix } from "@/src/server/uploads/_utils/keys"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/s3Client.server"
import { uploadSource } from "@/src/server/uploads/_utils/sources"
import { createUploadFilenameAllocator } from "@/src/server/uploads/_utils/uploadFilenameAllocation"
import { isReplaceableUpload } from "@/src/server/uploads/_utils/uploadInclude"
import {
  REPLACES_UPLOAD_ID_METADATA_KEY,
  S3_BUCKET,
  S3_MAX_FILE_SIZE_BYTES,
  S3_MAX_FILES_PROJECT,
} from "@/src/shared/uploads/config"

type CreateUploadRouterOptions = {
  keyPrefix: string
  userId: number
  /** Editors only: lets a file the user confirmed take over the upload it collides with. */
  allowFilenameReplacement?: boolean
  onBeforeUpload?: (
    files: { name: string; size: number; type: string }[],
    clientMetadata: Record<string, unknown> | null,
  ) => void | Promise<void>
}

/** Ids the dropzone reports the user chose to replace; authorized against the project below. */
const ReplacementMetadataSchema = z.object({
  replaceUploadIds: z.array(z.number().int().positive()).max(S3_MAX_FILES_PROJECT).optional(),
})

/**
 * Creates a Better Upload router with shared S3 configuration.
 * @param options - Configuration options including keyPrefix (e.g., project slug or "support") and userId
 * @returns A configured Router instance
 */
export function createUploadRouter(options: CreateUploadRouterOptions) {
  const { keyPrefix, userId, allowFilenameReplacement = false, onBeforeUpload } = options
  const s3Client = getConfiguredS3Client()

  return {
    client: s3Client,
    bucketName: S3_BUCKET,
    routes: {
      upload: route({
        multipleFiles: true,
        maxFileSize: S3_MAX_FILE_SIZE_BYTES,
        maxFiles: S3_MAX_FILES_PROJECT,
        onBeforeUpload: async ({ req: _req, files, clientMetadata }) => {
          const metadata = (clientMetadata ?? null) as Record<string, unknown> | null
          if (onBeforeUpload) {
            await onBeforeUpload(files, metadata)
          }

          const existing = await db.upload.findMany({
            where: { project: { slug: keyPrefix } },
            select: { id: true, externalUrl: true, title: true, surveyResponseId: true },
          })
          const claimFilename = createUploadFilenameAllocator({
            filenames: files.map((file) => file.name),
            existing,
            replacementTargets: allowFilenameReplacement
              ? confirmedReplacementTargets(existing, metadata)
              : [],
          })

          return {
            generateObjectInfo: ({ file }) => {
              const { filename, replacesUploadId } = claimFilename(file.name)
              return {
                key: `${getProjectUploadS3KeyPrefix(keyPrefix)}${crypto.randomUUID()}/${filename}`,
                metadata: {
                  userId: String(userId),
                  source: uploadSource.dropzone,
                  // Echoed back to the dropzone via `objectInfo.metadata`, so the server
                  // stays the only place that decides what replaces what.
                  ...(replacesUploadId
                    ? { [REPLACES_UPLOAD_ID_METADATA_KEY]: String(replacesUploadId) }
                    : {}),
                },
              }
            },
          }
        },
      }),
    },
  } satisfies Router
}

/** The dropzone names the uploads to replace; only project uploads it may replace count. */
function confirmedReplacementTargets<
  TUpload extends { id: number; surveyResponseId: number | null },
>(existing: TUpload[], clientMetadata: Record<string, unknown> | null) {
  const metadata = ReplacementMetadataSchema.safeParse(clientMetadata ?? {})
  const replaceUploadIds = new Set(metadata.success ? metadata.data.replaceUploadIds : undefined)
  if (!replaceUploadIds.size) return []

  return existing.filter((upload) => replaceUploadIds.has(upload.id) && isReplaceableUpload(upload))
}
