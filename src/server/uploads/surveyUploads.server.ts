import { z } from "zod"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { SurveyResponseStateEnum } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { generateSecureToken } from "@/src/server/utils/generateSecureToken.server"
import { deleteUploadFileAndDbRecord } from "./_utils/deleteUploadFileAndDbRecord"
import { isProjectUploadS3Url } from "./_utils/keys"
import {
  CreateSurveyUploadPublicSchema,
  DeleteSurveyUploadPublicSchema,
  GetUploadsMetaPublicSchema,
} from "./uploads.inputSchemas"

async function verifySurveyResponseSession(surveyResponseId: number, surveySessionId: number) {
  const surveyResponse = await db.surveyResponse.findFirst({
    where: {
      id: surveyResponseId,
      surveySessionId,
      state: SurveyResponseStateEnum.CREATED,
    },
    select: { id: true },
  })

  if (!surveyResponse) {
    throw new Error("Survey response not found or does not belong to the provided session")
  }
}

export async function createSurveyUploadPublic(
  input: z.infer<typeof CreateSurveyUploadPublicSchema>,
) {
  endpointAuth.public("survey session binding validated via surveyResponseId and surveySessionId")
  const surveyResponse = await db.surveyResponse.findFirst({
    where: {
      id: input.surveyResponseId,
      surveySessionId: input.surveySessionId,
      state: SurveyResponseStateEnum.CREATED,
    },
    select: {
      surveySession: {
        select: {
          survey: {
            select: {
              title: true,
              projectId: true,
              project: { select: { slug: true } },
            },
          },
        },
      },
    },
  })

  if (!surveyResponse) {
    throw new Error("Survey response not found or does not belong to the provided session")
  }

  const projectId = surveyResponse.surveySession.survey.projectId
  const projectSlug = surveyResponse.surveySession.survey.project.slug
  if (!isProjectUploadS3Url(input.externalUrl, projectSlug)) {
    throw new Error("Invalid upload URL")
  }

  const surveyTitle = surveyResponse.surveySession.survey.title
  const publicDeleteToken = generateSecureToken()

  const upload = await db.upload.create({
    data: {
      projectId,
      surveyResponseId: input.surveyResponseId,
      title: input.title,
      externalUrl: input.externalUrl,
      mimeType: input.mimeType ?? null,
      fileSize: input.fileSize ?? null,
      publicDeleteToken,
      createdById: null,
      updatedById: null,
      projectRecordEmailId: null,
      summary: null,
      latitude: null,
      longitude: null,
      collaborationUrl: null,
      collaborationPath: null,
    },
  })

  await createLogEntry({
    action: "CREATE",
    message: `Zu der Eingabe #${input.surveyResponseId} von ${frenchQuote(surveyTitle)} wurde ein Dokument hinzugefügt.`,
    userId: null,
    projectId,
    uploadId: upload.id,
    surveyResponseId: input.surveyResponseId,
    updatedRecord: {
      id: upload.id,
      title: upload.title,
      externalUrl: upload.externalUrl,
      mimeType: upload.mimeType,
      fileSize: upload.fileSize,
      surveyResponseId: upload.surveyResponseId,
    },
  })

  return upload
}

export async function getUploadsMetaPublic(input: z.infer<typeof GetUploadsMetaPublicSchema>) {
  endpointAuth.public("survey session binding validated via surveyResponseId and surveySessionId")
  await verifySurveyResponseSession(input.surveyResponseId, input.surveySessionId)

  return db.upload.findMany({
    where: {
      id: { in: input.ids },
      surveyResponseId: input.surveyResponseId,
    },
    select: {
      id: true,
      title: true,
      mimeType: true,
    },
  })
}

export async function deleteSurveyUploadPublic(
  input: z.infer<typeof DeleteSurveyUploadPublicSchema>,
) {
  endpointAuth.public("public delete token validated before survey upload deletion")
  const upload = await db.upload.findFirst({
    where: {
      id: input.id,
      surveyResponseId: input.surveyResponseId,
      publicDeleteToken: input.deleteToken,
      createdById: null,
      projectRecordEmailId: null,
      projectRecords: { none: {} },
      subsubsections: { none: {} },
      acquisitionAreas: { none: {} },
      surveyResponse: {
        id: input.surveyResponseId,
        surveySessionId: input.surveySessionId,
        state: SurveyResponseStateEnum.CREATED,
      },
    },
    select: {
      id: true,
      title: true,
      externalUrl: true,
      collaborationUrl: true,
      collaborationPath: true,
      surveyResponse: {
        select: {
          id: true,
          surveySession: {
            select: {
              survey: {
                select: {
                  title: true,
                  projectId: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!upload) {
    throw new Error("Upload not found or cannot be deleted in this context")
  }

  const surveyTitle = upload.surveyResponse!.surveySession.survey.title
  const projectId = upload.surveyResponse!.surveySession.survey.projectId

  await deleteUploadFileAndDbRecord(upload)

  await createLogEntry({
    action: "DELETE",
    message: `Zu der Eingabe #${input.surveyResponseId} von ${frenchQuote(surveyTitle)} wurde ein Dokument gelöscht.`,
    userId: null,
    projectId,
    surveyResponseId: input.surveyResponseId,
    previousRecord: { id: upload.id },
  })

  return { id: input.id }
}
