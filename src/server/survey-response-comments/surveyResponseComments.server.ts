import { z } from "zod"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import {
  loadUserRedactionContext,
  redactCommentAuthor,
} from "@/src/server/memberships/redactFormerProjectMemberUser.server"
import { AuthorizationError } from "@/src/shared/auth/errors"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { CreateSurveyResponseCommentSchema } from "@/src/shared/survey-response-comments/schemas"

export const CreateSurveyResponseCommentBySlugSchema = ProjectSlugRequiredSchema.and(
  CreateSurveyResponseCommentSchema,
)
export const UpdateSurveyResponseCommentSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
  body: CreateSurveyResponseCommentSchema.shape.body,
})
export const DeleteSurveyResponseCommentSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
})

const commentAuthorSelect = {
  id: true,
  firstName: true,
  lastName: true,
} as const

function commentInProjectWhere(projectSlug: string, id: number) {
  return { id, surveyResponse: { surveySession: { survey: { project: { slug: projectSlug } } } } }
}

export async function createSurveyResponseComment(
  headers: Headers,
  input: z.infer<typeof CreateSurveyResponseCommentBySlugSchema>,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const surveyResponse = await db.surveyResponse.findFirstOrThrow({
    where: surveyResponseInProjectWhere(input.projectSlug, input.surveyResponseId),
    select: {
      id: true,
      surveySession: {
        select: {
          survey: { select: { title: true, projectId: true } },
        },
      },
    },
  })
  const surveyTitle = surveyResponse.surveySession.survey.title

  const comment = await db.surveyResponseComment.create({
    data: {
      body: input.body,
      surveyResponseId: input.surveyResponseId,
      userId: Number(session.userId),
    },
    include: { author: { select: commentAuthorSelect } },
  })

  await createLogEntry({
    action: "CREATE",
    message: `Ein neuer Kommentar zur Eingabe #${surveyResponse.id} von ${frenchQuote(surveyTitle)} wurde erstellt.`,
    userId: Number(session.userId),
    projectId: surveyResponse.surveySession.survey.projectId,
    surveyResponseId: surveyResponse.id,
    surveyResponseCommentId: comment.id,
    updatedRecord: {
      id: comment.id,
      body: comment.body,
      surveyResponseId: comment.surveyResponseId,
      userId: comment.userId,
    },
  })

  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  return redactCommentAuthor(comment, redactionContext)
}

export async function updateSurveyResponseComment(
  headers: Headers,
  input: z.infer<typeof UpdateSurveyResponseCommentSchema>,
) {
  const { membershipRole, projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const canEditAnyComment = membershipRole === null || membershipRole === "EDITOR"
  const previous = await db.surveyResponseComment.findFirstOrThrow({
    where: commentInProjectWhere(input.projectSlug, input.id),
    select: {
      id: true,
      userId: true,
      body: true,
      surveyResponse: {
        select: {
          id: true,
          surveySession: {
            select: {
              survey: { select: { title: true, projectId: true } },
            },
          },
        },
      },
    },
  })

  if (!canEditAnyComment && previous.userId !== Number(session.userId)) {
    throw new AuthorizationError()
  }

  const surveyTitle = previous.surveyResponse.surveySession.survey.title

  const comment = await db.surveyResponseComment.update({
    where: { id: previous.id },
    data: { body: input.body },
    include: { author: { select: commentAuthorSelect } },
  })

  await createLogEntry({
    action: "UPDATE",
    message: `Ein Kommentar zur Eingabe #${previous.surveyResponse.id} von ${frenchQuote(surveyTitle)} wurde bearbeitet.`,
    userId: Number(session.userId),
    projectId: previous.surveyResponse.surveySession.survey.projectId,
    surveyResponseId: previous.surveyResponse.id,
    surveyResponseCommentId: comment.id,
    previousRecord: { id: previous.id, body: previous.body, userId: previous.userId },
    updatedRecord: { id: comment.id, body: comment.body, userId: comment.userId },
  })

  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  return redactCommentAuthor(comment, redactionContext)
}

export async function deleteSurveyResponseComment(
  headers: Headers,
  input: z.infer<typeof DeleteSurveyResponseCommentSchema>,
) {
  const { membershipRole, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const canDeleteAnyComment = membershipRole === null || membershipRole === "EDITOR"
  const previous = await db.surveyResponseComment.findFirstOrThrow({
    where: commentInProjectWhere(input.projectSlug, input.id),
    select: {
      id: true,
      userId: true,
      surveyResponse: {
        select: {
          id: true,
          surveySession: {
            select: {
              survey: { select: { title: true, projectId: true } },
            },
          },
        },
      },
    },
  })

  if (!canDeleteAnyComment && previous.userId !== Number(session.userId)) {
    throw new AuthorizationError()
  }

  const surveyTitle = previous.surveyResponse.surveySession.survey.title

  const deleted = await db.surveyResponseComment.deleteMany({
    where: commentInProjectWhere(input.projectSlug, previous.id),
  })

  await createLogEntry({
    action: "DELETE",
    message: `Ein Kommentar zur Eingabe #${previous.surveyResponse.id} von ${frenchQuote(surveyTitle)} wurde gelöscht.`,
    userId: Number(session.userId),
    projectId: previous.surveyResponse.surveySession.survey.projectId,
    surveyResponseId: previous.surveyResponse.id,
    previousRecord: { id: previous.id },
  })

  return deleted
}

function surveyResponseInProjectWhere(projectSlug: string, id: number) {
  return { id, surveySession: { survey: { project: { slug: projectSlug } } } }
}
