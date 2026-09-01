import { z } from "zod"
import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { CreateSurveySchema } from "@/src/shared/surveys/schemas"
import {
  CreateAdminSurveySchema,
  CreateSurveyBySlugSchema,
  DeleteAdminSurveySchema,
  DeleteSurveySchema,
  GetAdminSurveySchema,
  GetSurveySchema,
  GetSurveysSchema,
  UpdateAdminSurveySchema,
  UpdateSurveyBySlugSchema,
} from "./surveys.inputSchemas"

const SurveyInputSchema = CreateSurveySchema.omit({ projectId: true })

export type GetSurveysInput = z.infer<typeof GetSurveysSchema>

function surveyInProjectWhere(projectSlug: string, id: number) {
  return { id, project: { slug: projectSlug } }
}

function surveyData(input: z.infer<typeof SurveyInputSchema>, projectId: number) {
  return {
    ...input,
    projectId,
    surveyResultsUrl: input.surveyResultsUrl || null,
  }
}

export async function getSurveys(headers: Headers, input: z.infer<typeof GetSurveysSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  return db.survey.findMany({
    orderBy: { slug: "asc" },
    where: { project: { slug: input.projectSlug } },
  })
}

export async function getSurvey(headers: Headers, input: z.infer<typeof GetSurveySchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  return db.survey.findFirstOrThrow({
    where: surveyInProjectWhere(input.projectSlug, input.id),
  })
}

export async function createSurvey(
  headers: Headers,
  input: z.infer<typeof CreateSurveyBySlugSchema>,
) {
  const { projectId } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { projectSlug: _projectSlug, ...data } = input

  return db.survey.create({
    data: surveyData(data, projectId),
  })
}

export async function updateSurvey(
  headers: Headers,
  input: z.infer<typeof UpdateSurveyBySlugSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug, ...data } = input
  const previous = await db.survey.findFirstOrThrow({
    where: surveyInProjectWhere(projectSlug, id),
    select: { id: true, projectId: true },
  })

  return db.survey.update({
    where: { id: previous.id },
    data: surveyData(data, previous.projectId),
  })
}

export async function deleteSurvey(headers: Headers, input: z.infer<typeof DeleteSurveySchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)

  return db.survey.deleteMany({
    where: surveyInProjectWhere(input.projectSlug, input.id),
  })
}

export async function getAdminSurveysByProject(
  headers: Headers,
  input: z.infer<typeof GetSurveysSchema>,
) {
  await endpointAuth.admin(headers)

  return db.survey.findMany({
    orderBy: { id: "asc" },
    where: { project: { slug: input.projectSlug } },
  })
}

export async function getAdminSurvey(
  headers: Headers,
  input: z.infer<typeof GetAdminSurveySchema>,
) {
  await endpointAuth.admin(headers)

  return db.survey.findFirstOrThrow({
    where: { id: input.id },
    include: {
      project: {
        select: {
          slug: true,
        },
      },
    },
  })
}

export async function createAdminSurvey(
  headers: Headers,
  input: z.infer<typeof CreateAdminSurveySchema>,
) {
  const { userId } = await endpointAuth.admin(headers)
  const survey = await db.survey.create({ data: input })

  await createLogEntry({
    action: "CREATE",
    message: `Neue Beteiligung ${frenchQuote(survey.title)} wurde erstellt.`,
    userId: Number(userId),
    projectId: input.projectId,
    surveyId: survey.id,
    updatedRecord: {
      id: survey.id,
      slug: survey.slug,
      title: survey.title,
      active: survey.active,
      projectId: survey.projectId,
    },
  })

  return survey
}

export async function updateAdminSurvey(
  headers: Headers,
  input: z.infer<typeof UpdateAdminSurveySchema>,
) {
  const { userId } = await endpointAuth.admin(headers)
  const { id, ...data } = input
  const previous = await db.survey.findFirstOrThrow({
    where: { id },
    select: { id: true, active: true, title: true, projectId: true },
  })
  const updatedSurvey = await db.survey.update({ where: { id }, data })

  if (previous.active !== updatedSurvey.active) {
    await createLogEntry({
      action: "UPDATE",
      message: updatedSurvey.active
        ? `Beteiligung ${frenchQuote(updatedSurvey.title)} wurde aktiviert.`
        : `Beteiligung ${frenchQuote(updatedSurvey.title)} wurde deaktiviert.`,
      userId: Number(userId),
      projectId: previous.projectId,
      surveyId: updatedSurvey.id,
      previousRecord: { id: previous.id, active: previous.active, title: previous.title },
      updatedRecord: {
        id: updatedSurvey.id,
        active: updatedSurvey.active,
        title: updatedSurvey.title,
      },
    })
  }

  return { ...updatedSurvey, slug: updatedSurvey.slug as AllowedSurveySlugs }
}

export async function deleteAdminSurvey(
  headers: Headers,
  input: z.infer<typeof DeleteAdminSurveySchema>,
) {
  await endpointAuth.admin(headers)

  return db.survey.deleteMany({ where: { id: input.id } })
}
