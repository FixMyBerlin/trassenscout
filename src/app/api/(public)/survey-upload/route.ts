import db from "@/db"
import { isSupportedMimeType } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET, S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES } from "@/src/server/uploads/_utils/config"
import { generateS3Key } from "@/src/server/uploads/_utils/keys"
import { uploadSource } from "@/src/server/uploads/_utils/sources"
import { route, Router } from "@better-upload/server"
import { toRouteHandler } from "@better-upload/server/adapters/next"
import { z } from "zod"

const RequestParamsSchema = z.object({
  surveyResponseId: z.coerce.number().int().positive(),
  surveySessionId: z.coerce.number().int().positive(),
})

/**
 * A lot of duplication with src/app/api/(auth)/[projectSlug]/upload/route.ts
 * but this is a public route and we want to keep it simple for now.
 * We might want to add token authentication in the future.
 */
async function verifySurveyResponseSession(surveyResponseId: number, surveySessionId: number) {
  const surveyResponse = await db.surveyResponse.findFirst({
    where: {
      id: surveyResponseId,
      surveySessionId: surveySessionId,
    },
    select: {
      surveySession: {
        select: {
          survey: {
            select: {
              project: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!surveyResponse) {
    throw new Error("Survey response not found or does not belong to the provided session")
  }

  return {
    projectSlug: surveyResponse.surveySession.survey.project.slug,
  }
}

function createRouter() {
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
          const metadata = (clientMetadata ?? {}) as Record<string, unknown>

          // Extract and validate request parameters from clientMetadata
          const params = RequestParamsSchema.safeParse({
            surveyResponseId: metadata.surveyResponseId,
            surveySessionId: metadata.surveySessionId,
          })

          if (!params.success) {
            throw new Error("Missing or invalid surveyResponseId or surveySessionId")
          }

          // Verify that surveyResponseId belongs to surveySessionId
          const { projectSlug: verifiedProjectSlug } = await verifySurveyResponseSession(
            params.data.surveyResponseId,
            params.data.surveySessionId,
          )

          // Validate file types
          for (const file of files) {
            if (!isSupportedMimeType(file.type)) {
              throw new Error(
                `Dateityp nicht erlaubt: ${file.type || "unbekannt"}. Erlaubt sind Bilder, PDF und Office-Dokumente.`,
              )
            }
          }

          return {
            generateObjectInfo: ({ file }) => {
              const key = generateS3Key(verifiedProjectSlug, file.name)
              return {
                key,
                metadata: {
                  surveyResponseId: String(params.data.surveyResponseId),
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

export const POST = async (request: Request) => {
  try {
    const router = createRouter()
    const handler = toRouteHandler(router)
    return await handler.POST(request)
  } catch (error) {
    console.error("Public survey upload route error:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
