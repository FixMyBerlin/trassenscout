import { z } from "zod"
import { allowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getSelectedOptionLabels } from "@/src/components/beteiligung/shared/utils/getSelectedOptionLabels"
import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import { getFlatSurveyFormFields } from "@/src/components/surveys/[surveyId]/responses/getFlatSurveyFormFields"
import { SurveyResponseStateEnum, UserRoleEnum } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { requireMcpDirectProject } from "@/src/server/mcp/direct/requireMcpDirectProject.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { mcpListResult, resolveMcpListLimit } from "@/src/server/mcp/mcpListLimit.const"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"
import {
  loadUserRedactionContext,
  serializeProjectUser,
} from "@/src/server/memberships/redactFormerProjectMemberUser.server"
import {
  deleteResponsesWithOrphanedRelations,
  findLinkedSubsubsectionForSurveyResponse,
  orphanedUploadWhere,
} from "@/src/server/survey-responses/surveyResponses.server"

type FlatField = ReturnType<typeof getFlatSurveyFormFields>[number]

// Eingaben are the submitted part-2 responses, as in the app's Eingaben list.
const eingabeWhere = (projectId: number, surveySlug?: string | null) => ({
  state: SurveyResponseStateEnum.SUBMITTED,
  surveyPart: 2,
  surveySession: { survey: { projectId, ...(surveySlug ? { slug: surveySlug } : {}) } },
})

const surveyUrl = (origin: string, projectSlug: string, surveyId: number) =>
  `${origin}/${projectSlug}/surveys/${surveyId}`

const responseUrl = (origin: string, projectSlug: string, surveyId: number, id: number) =>
  `${surveyUrl(origin, projectSlug, surveyId)}/responses?responseDetails=${id}`

const surveySlugSchema = z.enum(allowedSurveySlugs)
const responseDataSchema = z.record(z.string(), z.unknown())

// A survey without a config in the app keeps raw keys instead of labels.
function surveyConfig(slug: string) {
  const configSlug = surveySlugSchema.safeParse(slug).data
  if (!configSlug) return null
  return {
    statuses: getConfigBySurveySlug(configSlug, "backend").status,
    fieldsByPart: new Map([
      [1, getFlatSurveyFormFields(getConfigBySurveySlug(configSlug, "part1"))],
      [2, getFlatSurveyFormFields(getConfigBySurveySlug(configSlug, "part2"))],
      [3, getFlatSurveyFormFields(getConfigBySurveySlug(configSlug, "part3"))],
    ]),
  }
}

function parseResponseData(raw: string) {
  try {
    return responseDataSchema.safeParse(JSON.parse(raw)).data ?? {}
  } catch {
    return {}
  }
}

const isEmptyAnswer = (value: unknown) =>
  value == null || value === "" || (Array.isArray(value) && value.length === 0)

// Contact data stays out of MCP; radnetz-brandenburg asks name, email and PIN in part 1 under numeric keys.
const contactKeys = new Set(["contact", "phone", "email", "firstName", "lastName"])
const isContactAnswer = (surveySlug: string, part: number, key: string, field?: FlatField) =>
  contactKeys.has(key) ||
  (surveySlug === "radnetz-brandenburg" && part === 1 && ["1", "2", "3", "4"].includes(key)) ||
  (field != null &&
    "type" in field.props &&
    (field.props.type === "email" || field.props.type === "tel"))

function answerText(field: FlatField | undefined, value: unknown) {
  const optionLabels = getSelectedOptionLabels(field, value)
  if (optionLabels) return optionLabels.join(", ")
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : JSON.stringify(value)
}

// Configured questions first, in form order; keys the config does not know keep their raw name.
function labelledAnswers(
  surveySlug: string,
  part: number,
  data: Record<string, unknown>,
  fields: FlatField[],
) {
  const configuredNames = new Set(fields.map((field) => String(field.name)))
  const shown = (key: string, value: unknown, field?: FlatField) =>
    !isEmptyAnswer(value) && !isContactAnswer(surveySlug, part, key, field)
  return [
    ...fields
      .filter((field) => shown(String(field.name), data[String(field.name)], field))
      .map((field) => ({
        part,
        question: field.props.label || String(field.name),
        answer: answerText(field, data[String(field.name)]),
      })),
    ...Object.entries(data)
      .filter(([key, value]) => !configuredNames.has(key) && shown(key, value))
      .map(([key, value]) => ({ part, question: key, answer: answerText(undefined, value) })),
  ]
}

export async function listSurveysForMcp(input: { projectSlug: string; origin: string }) {
  const project = await requireMcpEnabledProject(input.projectSlug)
  const surveys = await db.survey.findMany({
    where: { projectId: project.id },
    orderBy: { id: "asc" },
    select: { id: true, slug: true, title: true, active: true, startDate: true, endDate: true },
  })
  const items = await Promise.all(
    surveys.map(async (survey) => ({
      projectSlug: project.slug,
      slug: survey.slug,
      title: survey.title,
      active: survey.active,
      startDate: survey.startDate,
      endDate: survey.endDate,
      responseCount: await db.surveyResponse.count({
        where: eingabeWhere(project.id, survey.slug),
      }),
      statuses:
        surveyConfig(survey.slug)?.statuses.map(({ value, label }) => ({ value, label })) ?? [],
      url: surveyUrl(input.origin, project.slug, survey.id),
    })),
  )
  return { returned: items.length, items }
}

export async function listSurveyResponsesForMcp(input: {
  projectSlug: string
  surveySlug?: string | null
  status?: string | null
  ids?: number[] | null
  beforeId?: number | null
  includeAnswers?: boolean
  limit?: number
  origin: string
  viewerUserId: number
}) {
  const limit = resolveMcpListLimit(input.limit)
  const project = await requireMcpEnabledProject(input.projectSlug)
  if (input.surveySlug) {
    const survey = await db.survey.findFirst({
      where: { projectId: project.id, slug: input.surveySlug },
      select: { id: true },
    })
    if (!survey) throw new Error(`Beteiligung nicht gefunden: ${input.surveySlug}`)
  }

  const idFilter = {
    ...(input.ids?.length ? { in: input.ids } : {}),
    ...(input.beforeId ? { lt: input.beforeId } : {}),
  }
  const rows = await db.surveyResponse.findMany({
    where: {
      ...eingabeWhere(project.id, input.surveySlug),
      ...(input.status ? { status: input.status } : {}),
      ...(Object.keys(idFilter).length ? { id: idFilter } : {}),
    },
    orderBy: { id: "desc" },
    take: limit + 1,
    select: {
      id: true,
      data: true,
      status: true,
      note: true,
      source: true,
      surveySessionId: true,
      surveySession: {
        select: { createdAt: true, survey: { select: { id: true, slug: true } } },
      },
      operator: { select: { title: true } },
      surveyResponseTags: { select: { title: true } },
      surveyResponseComments: {
        orderBy: { id: "asc" },
        select: {
          createdAt: true,
          body: true,
          author: {
            select: { id: true, role: true, firstName: true, institution: true, lastName: true },
          },
        },
      },
      uploads: { orderBy: { id: "asc" }, select: { id: true, title: true } },
    },
  })
  const page = mcpListResult(rows, limit)

  const [sessionParts, redactionContext] = input.includeAnswers
    ? await Promise.all([
        db.surveyResponse.findMany({
          where: {
            surveySessionId: { in: page.items.map((row) => row.surveySessionId) },
            surveyPart: { in: [1, 3] },
          },
          select: { surveySessionId: true, surveyPart: true, data: true },
        }),
        // Non-admin view: former members stay anonymous.
        loadUserRedactionContext(project.id, UserRoleEnum.USER, input.viewerUserId),
      ])
    : [[], null]

  const configs = new Map<string, ReturnType<typeof surveyConfig>>()
  const configFor = (slug: string) => {
    if (!configs.has(slug)) configs.set(slug, surveyConfig(slug))
    return configs.get(slug) ?? null
  }

  return {
    limit: page.limit,
    returned: page.returned,
    truncated: page.truncated,
    items: page.items.map((row) => {
      const survey = row.surveySession.survey
      const config = configFor(survey.slug)
      const summary = {
        projectSlug: project.slug,
        id: row.id,
        surveySlug: survey.slug,
        createdAt: row.surveySession.createdAt,
        status: row.status,
        statusLabel: config?.statuses.find((status) => status.value === row.status)?.label ?? null,
        source: row.source,
        operator: row.operator?.title ?? null,
        tags: row.surveyResponseTags.map((tag) => tag.title),
        note: row.note,
        commentCount: row.surveyResponseComments.length,
        uploadCount: row.uploads.length,
        url: responseUrl(input.origin, project.slug, survey.id, row.id),
      }
      if (!redactionContext) return summary

      const fieldsFor = (part: number) => config?.fieldsByPart.get(part) ?? []
      const partsOfSession = sessionParts
        .filter((part) => part.surveySessionId === row.surveySessionId)
        .sort((a, b) => a.surveyPart - b.surveyPart)
      return {
        ...summary,
        answers: [
          ...partsOfSession
            .filter((part) => part.surveyPart === 1)
            .flatMap((part) =>
              labelledAnswers(survey.slug, 1, parseResponseData(part.data), fieldsFor(1)),
            ),
          ...labelledAnswers(survey.slug, 2, parseResponseData(row.data), fieldsFor(2)),
          ...partsOfSession
            .filter((part) => part.surveyPart === 3)
            .flatMap((part) =>
              labelledAnswers(survey.slug, 3, parseResponseData(part.data), fieldsFor(3)),
            ),
        ],
        comments: row.surveyResponseComments.map((comment) => ({
          author:
            getFullnameWithInstitution(serializeProjectUser(comment.author, redactionContext)) ??
            "Nutzer*in",
          createdAt: comment.createdAt,
          body: comment.body,
        })),
        uploads: row.uploads,
      }
    }),
  }
}

export async function deleteSurveyResponsesForMcp(input: {
  items: { projectSlug: string; id: number }[]
  confirm?: boolean
  origin: string
  createdById: number
}) {
  const seen = new Map<string, { projectSlug: string; id: number }>()
  for (const item of input.items) {
    const key = `${item.projectSlug}\0${item.id}`
    seen.delete(key)
    seen.set(key, item)
  }
  const results = []
  let deletedCount = 0
  for (const item of seen.values()) {
    try {
      const project = await requireMcpDirectProject(item.projectSlug)
      const row = await db.surveyResponse.findFirst({
        where: { id: item.id, ...eingabeWhere(project.id) },
        select: {
          id: true,
          status: true,
          surveySession: { select: { survey: { select: { id: true, slug: true } } } },
          _count: { select: { surveyResponseComments: true } },
          uploads: { orderBy: { id: "asc" }, select: { id: true, title: true } },
        },
      })
      if (!row) throw new Error(`Eingabe nicht gefunden: ${item.id}`)
      const survey = row.surveySession.survey
      const orphanedUploads = await db.upload.findMany({
        where: orphanedUploadWhere([row.id]),
        select: { id: true },
      })
      const orphanedIds = new Set(orphanedUploads.map((upload) => upload.id))
      const details = {
        surveySlug: survey.slug,
        url: responseUrl(input.origin, project.slug, survey.id, row.id),
        commentCount: row._count.surveyResponseComments,
        uploadsDeleted: row.uploads.filter((upload) => orphanedIds.has(upload.id)),
        uploadsKept: row.uploads.filter((upload) => !orphanedIds.has(upload.id)),
      }
      const linkedSubsubsection = await findLinkedSubsubsectionForSurveyResponse(row.id)
      const errors = linkedSubsubsection
        ? [
            `Eingabe ${row.id} ist mit der Maßnahme „${linkedSubsubsection.slug}“ verknüpft und kann nicht gelöscht werden.`,
          ]
        : []
      if (!input.confirm || errors.length) {
        results.push({ ...item, ...details, deleted: false, errors })
        continue
      }
      await deleteResponsesWithOrphanedRelations([row.id])
      await createLogEntry({
        action: "DELETE",
        message: `Eingabe ${row.id} wurde gelöscht.`,
        userId: input.createdById,
        projectId: project.id,
        surveyId: survey.id,
        previousRecord: { id: row.id, status: row.status },
      })
      deletedCount += 1
      results.push({ ...item, ...details, deleted: true, errors: [] as string[] })
    } catch (error) {
      results.push({
        ...item,
        surveySlug: null,
        url: null,
        commentCount: 0,
        uploadsDeleted: [],
        uploadsKept: [],
        deleted: false,
        errors: [error instanceof Error ? error.message : String(error)],
      })
    }
  }
  return {
    environment: mcpEnvLabel(process.env.VITE_APP_ENV),
    confirm: input.confirm === true,
    returned: results.length,
    deletedCount,
    items: results,
  }
}
