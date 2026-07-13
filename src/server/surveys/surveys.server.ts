import { z } from "zod"
import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
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

export async function getAdminSurveys(headers: Headers) {
  await endpointAuth.admin(headers)

  return db.survey.findMany({
    orderBy: { id: "asc" },
    take: 100,
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
  await endpointAuth.admin(headers)

  return db.survey.create({ data: input })
}

export async function updateAdminSurvey(
  headers: Headers,
  input: z.infer<typeof UpdateAdminSurveySchema>,
) {
  await endpointAuth.admin(headers)
  const { id, ...data } = input
  const updatedSurvey = await db.survey.update({ where: { id }, data })

  return { ...updatedSurvey, slug: updatedSurvey.slug as AllowedSurveySlugs }
}

export async function deleteAdminSurvey(
  headers: Headers,
  input: z.infer<typeof DeleteAdminSurveySchema>,
) {
  await endpointAuth.admin(headers)

  return db.survey.deleteMany({ where: { id: input.id } })
}
