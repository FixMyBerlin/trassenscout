import { withAdminAuth } from "@/src/app/api/(auth)/_utils/withAdminAuth"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET, S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES } from "@/src/server/uploads/_utils/config"
import { sanitizeKey } from "@/src/server/uploads/_utils/keys"
import { uploadSource } from "@/src/server/uploads/_utils/sources"
import { route, Router } from "@better-upload/server"
import { toRouteHandler } from "@better-upload/server/adapters/next"
import { v4 as uuidv4 } from "uuid"

function generateSupportS3Key(filename: string) {
  const rootFolder = process.env.S3_UPLOAD_ROOTFOLDER
  const sanitizedFilename = sanitizeKey(filename)
  return `${rootFolder}/support/${uuidv4()}/${sanitizedFilename}` as const
}

// Note: This route has overlap with /api/(auth)/[projectSlug]/upload/route.ts,
// but is intentionally kept separate — it's unclear whether this approach will stay long-term.

function createRouter(userId: number) {
  const s3Client = getConfiguredS3Client()
  return {
    client: s3Client,
    bucketName: S3_BUCKET,
    routes: {
      upload: route({
        multipleFiles: true,
        maxFileSize: S3_MAX_FILE_SIZE_BYTES,
        maxFiles: S3_MAX_FILES,
        onBeforeUpload: async ({ req, files, clientMetadata }) => {
          // Only allow PDF files
          for (const file of files) {
            if (file.type !== "application/pdf") {
              throw new Error(
                `Dateityp nicht erlaubt: ${file.type || "unbekannt"}. Nur PDF-Dateien sind erlaubt.`,
              )
            }
          }

          return {
            generateObjectInfo: ({ file }) => {
              const key = generateSupportS3Key(file.name)
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

export const POST = withAdminAuth(async ({ params, request, userId }) => {
  try {
    const router = createRouter(userId)
    const handler = toRouteHandler(router)
    return await handler.POST(request)
  } catch (error) {
    console.error("Support upload route error:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
})
