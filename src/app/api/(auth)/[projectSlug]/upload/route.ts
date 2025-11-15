import { withProjectMembership } from "@/src/app/api/(auth)/_utils/withProjectMembership"
import { editorRoles } from "@/src/authorization/constants"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET, S3_MAX_FILE_SIZE_BYTES } from "@/src/server/uploads/_utils/config"
import { generateS3Key } from "@/src/server/uploads/_utils/keys"
import { uploadSource } from "@/src/server/uploads/_utils/sources"
import { route, Router } from "@better-upload/server"
import { toRouteHandler } from "@better-upload/server/adapters/next"

const s3Client = getConfiguredS3Client()

function createRouter(projectSlug: string, userId: number) {
  return {
    client: s3Client,
    bucketName: S3_BUCKET,
    routes: {
      upload: route({
        multipleFiles: true,
        maxFileSize: S3_MAX_FILE_SIZE_BYTES,
        onBeforeUpload: async ({ req, files, clientMetadata }) => {
          return {
            generateObjectInfo: ({ file }) => {
              const key = generateS3Key(projectSlug, file.name)
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

export const POST = withProjectMembership(editorRoles, async ({ params, request, userId }) => {
  try {
    const { projectSlug } = params
    const router = createRouter(projectSlug, userId)
    const handler = toRouteHandler(router)
    return await handler.POST(request)
  } catch (error) {
    console.error("Upload route error:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
})
