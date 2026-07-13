import { handleRequest, RejectUpload, route, type Router } from "@better-upload/server"
import { z } from "zod"
import {
  isSupportedMimeType,
  isSupportedUploadFilename,
} from "@/src/components/core/uploads/getFileType"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { authErrorToResponse } from "@/src/shared/auth/errors"
import { S3_BUCKET, S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES_SURVEY } from "@/src/shared/uploads/config"
import { createUploadRouter } from "./_utils/createUploadRouter"
import { generateS3Key } from "./_utils/keys"
import { getConfiguredS3Client } from "./_utils/s3Client.server"
import { uploadSource } from "./_utils/sources"

const SurveyUploadParamsSchema = z.object({
  surveyResponseId: z.coerce.number().int().positive(),
  surveySessionId: z.coerce.number().int().positive(),
})

function assertSupportedUploadMimeTypes(files: { name: string; type: string }[]) {
  for (const file of files) {
    if (!isSupportedMimeType(file.type)) {
      throw new RejectUpload(
        `Dateityp nicht erlaubt: ${file.type || "unbekannt"}. Erlaubt sind Bilder, PDF und Office-Dokumente.`,
      )
    }

    if (!isSupportedUploadFilename(file.name)) {
      throw new RejectUpload(
        "Dateiendung nicht erlaubt. Erlaubt sind Bilder, PDF und Office-Dokumente.",
      )
    }
  }
}

async function verifySurveyResponseSession(surveyResponseId: number, surveySessionId: number) {
  const surveyResponse = await db.surveyResponse.findFirst({
    where: {
      id: surveyResponseId,
      surveySessionId,
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
    throw new RejectUpload("Survey response not found or does not belong to the provided session")
  }

  return {
    projectSlug: surveyResponse.surveySession.survey.project.slug,
  }
}

function createSurveyUploadRouter() {
  return {
    client: getConfiguredS3Client(),
    bucketName: S3_BUCKET,
    routes: {
      upload: route({
        multipleFiles: true,
        maxFileSize: S3_MAX_FILE_SIZE_BYTES,
        maxFiles: S3_MAX_FILES_SURVEY,
        onBeforeUpload: async ({ files, clientMetadata }) => {
          const metadata = (clientMetadata ?? {}) as Record<string, unknown>
          const params = SurveyUploadParamsSchema.safeParse({
            surveyResponseId: metadata.surveyResponseId,
            surveySessionId: metadata.surveySessionId,
          })

          if (!params.success) {
            throw new RejectUpload("Missing or invalid surveyResponseId or surveySessionId")
          }

          const { projectSlug } = await verifySurveyResponseSession(
            params.data.surveyResponseId,
            params.data.surveySessionId,
          )

          assertSupportedUploadMimeTypes(files)

          return {
            generateObjectInfo: ({ file }) => {
              const key = generateS3Key(projectSlug, file.name)
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

function uploadErrorResponse(error: unknown) {
  const authResponse = authErrorToResponse(error)
  if (authResponse) return authResponse

  return Response.json(
    { error: error instanceof Error ? error.message : "Internal server error" },
    { status: 500 },
  )
}

export async function handleSurveyUploadRoute(request: Request) {
  endpointAuth.public("survey session binding validated in onBeforeUpload")
  try {
    return handleRequest(request, createSurveyUploadRouter())
  } catch (error) {
    console.error("Public survey upload route error:", error)
    return uploadErrorResponse(error)
  }
}

export async function handleProjectUploadRoute(request: Request, projectSlug: string) {
  const session = await endpointAuth.projectMember({
    headers: request.headers,
    projectSlug,
    roles: editorRoles,
  })

  try {
    const router = createUploadRouter({
      keyPrefix: projectSlug,
      userId: Number(session.userId),
      onBeforeUpload: async (files) => {
        assertSupportedUploadMimeTypes(files)
      },
    })

    return handleRequest(request, router)
  } catch (error) {
    console.error("Upload route error:", error)
    return uploadErrorResponse(error)
  }
}

export async function handleSupportDocumentUploadRoute(request: Request) {
  const session = await endpointAuth.admin(request.headers)

  try {
    const router = createUploadRouter({
      keyPrefix: "support",
      userId: Number(session.userId),
      onBeforeUpload: async (files) => {
        assertSupportedUploadMimeTypes(files)
      },
    })

    return handleRequest(request, router)
  } catch (error) {
    console.error("Support document upload route error:", error)
    return uploadErrorResponse(error)
  }
}
