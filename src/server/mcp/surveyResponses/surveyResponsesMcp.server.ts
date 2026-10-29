import { z } from "zod"
import {
  allowedSurveySlugs,
  type AllowedSurveySlugs,
} from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { getSelectedOptionLabels } from "@/src/components/beteiligung/shared/utils/getSelectedOptionLabels"
import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import { getFlatSurveyFormFields } from "@/src/components/surveys/[surveyId]/responses/getFlatSurveyFormFields"
import {
  SurveyResponseSourceEnum,
  SurveyResponseStateEnum,
  UserRoleEnum,
} from "@/src/prisma/generated/client"
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
import { createNextOhvReferenceId } from "@/src/server/survey-responses/utils/ohvReferenceId"

type FlatField = ReturnType<typeof getFlatSurveyFormFields>[number]
type AnswerField = Exclude<FlatField, { component: "hidden" }>
type ConditionValue = Parameters<NonNullable<AnswerField["condition"]>["conditionFn"]>[0]
type Answers = Record<string, unknown>

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
    slug: configSlug,
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

// MCP never returns contact data; radnetz-brandenburg asks name, email and PIN in part 1 under numeric keys.
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

async function surveyOfProject(projectId: number, surveySlug: string) {
  const survey = await db.survey.findFirst({
    where: { projectId, slug: surveySlug },
    select: { id: true, slug: true },
  })
  if (!survey) throw new Error(`Beteiligung nicht gefunden: ${surveySlug}`)
  return survey
}

function requireSurveyConfig(slug: string) {
  const config = surveyConfig(slug)
  if (!config) throw new Error(`Beteiligung ${slug} hat kein Formular in der App`)
  return config
}

// Uploads need files and the app sets the Vorgangs-ID, so MCP answers only these components.
const answerTypes: Partial<Record<FlatField["component"], string>> = {
  SurveyTextfield: "text",
  SurveyTextarea: "text",
  SurveyReadonlyTextfield: "text",
  SurveyNumberfield: "number",
  SurveyCheckbox: "boolean",
  SurveyRadiobuttonGroup: "option",
  SurveySelect: "option",
  SurveyCheckboxGroup: "options",
  SurveySimpleMapWithLegend: "latLng",
  SwitchableMap: "latLng",
  SurveyGeoCategoryMapWithLegend: "geometry",
  hidden: "text",
}

const isAnswerField = (field: FlatField): field is AnswerField => field.component !== "hidden"

const optionsOf = (field: FlatField) =>
  (field.props as { options?: { key: string | number; label: string }[] }).options

const writableFields = (fields: FlatField[]) =>
  fields.filter((field) => answerTypes[field.component] != null)

// Required as create checks it: the form schema rejects the default, or a condition asks for it.
const isRequiredAnswer = (field: FlatField) =>
  isAnswerField(field) &&
  (field.condition
    ? field.validation.required
    : !field.validation.zodSchema.safeParse(field.defaultValue).success)

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
  if (input.surveySlug) await surveyOfProject(project.id, input.surveySlug)

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

export async function getSurveyResponsesSchemaForMcp(input: {
  projectSlug: string
  surveySlug: string
}) {
  const project = await requireMcpEnabledProject(input.projectSlug)
  const survey = await surveyOfProject(project.id, input.surveySlug)
  const config = requireSurveyConfig(survey.slug)
  return {
    projectSlug: project.slug,
    surveySlug: survey.slug,
    statuses: config.statuses.map(({ value, label }) => ({ value, label })),
    parts: [...config.fieldsByPart]
      .filter(([, fields]) => fields.length > 0)
      .map(([part, fields]) => ({
        part,
        questions: writableFields(fields).map((field) => {
          const options = optionsOf(field)
          const contact = isContactAnswer(survey.slug, part, String(field.name), field)
          return {
            name: String(field.name),
            label: field.props.label || String(field.name),
            answerType: answerTypes[field.component],
            required: !contact && isRequiredAnswer(field),
            ...(contact ? { contact: true } : {}),
            ...(options
              ? { options: options.map(({ key, label }) => ({ key: String(key), label })) }
              : {}),
            ...(isAnswerField(field) && field.condition
              ? { dependsOn: field.condition.fieldName }
              : {}),
          }
        }),
      })),
  }
}

// The config's own field validators, given the parts of the field API they read.
function fieldRuleError(field: AnswerField, data: Answers, answers: Answers) {
  const name = String(field.name)
  const fieldApi = {
    name,
    state: { value: data[name], meta: { isPristine: !(name in answers) } },
    form: { getFieldValue: (other: string) => data[other] },
  }
  for (const validate of Object.values(field.validators ?? {})) {
    if (typeof validate !== "function") continue
    const message: unknown = validate({ value: data[name], fieldApi } as never)
    if (typeof message === "string") return message
  }
  return null
}

function answerError(field: FlatField, data: Answers, answers: Answers) {
  const name = String(field.name)
  const value = data[name]
  if (!isAnswerField(field)) {
    return value === undefined || typeof value === "string" || typeof value === "number"
      ? null
      : "Text erwartet"
  }
  if (field.condition) {
    const { fieldName, conditionFn } = field.condition
    if (!conditionFn(data[fieldName] as ConditionValue)) {
      return name in answers ? `passt nicht zur Antwort in ${fieldName}` : null
    }
    if (field.validation.required && isEmptyAnswer(answers[name])) return "Pflichtfeld."
  }
  const parsed = field.validation.zodSchema.safeParse(value)
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "ungültig"
  const options = optionsOf(field)
  if (options && name in answers && !isEmptyAnswer(value)) {
    const keys = new Set(options.map((option) => String(option.key)))
    const unknown = (Array.isArray(value) ? value : [value]).filter((v) => !keys.has(String(v)))
    if (unknown.length > 0) return `unbekannte Option ${unknown.join(", ")}`
  }
  return fieldRuleError(field, data, answers)
}

// Same checks and defaults as the public form, so the answers land in the shape the app reads.
function partData(surveySlug: string, part: number, fields: FlatField[], answers: Answers) {
  const writable = writableFields(fields)
  const writableNames = new Set(writable.map((field) => String(field.name)))
  const knownNames = new Set(fields.map((field) => String(field.name)))
  const errors = Object.keys(answers)
    .filter((key) => !writableNames.has(key))
    .map((key) =>
      knownNames.has(key)
        ? `Teil ${part}: ${key} nimmt MCP nicht an`
        : `Teil ${part}: unbekannte Frage ${key}`,
    )
  const data: Answers = {
    ...Object.fromEntries(
      fields.filter(isAnswerField).map((field) => [String(field.name), field.defaultValue]),
    ),
    ...Object.fromEntries(Object.entries(answers).filter(([key]) => writableNames.has(key))),
  }
  // The SwitchableMap stores how the place was given; MCP sets a pin or none.
  const switchableMap = fields.find((field) => field.component === "SwitchableMap")
  if (switchableMap) data.locationMode = data[String(switchableMap.name)] ? "pin" : "none"
  for (const field of writable) {
    const name = String(field.name)
    // Contact data is optional over MCP and checked like the form only when sent.
    if (isContactAnswer(surveySlug, part, name, field) && isEmptyAnswer(answers[name])) continue
    const error = answerError(field, data, answers)
    if (error) errors.push(`Teil ${part}: ${name}: ${error}`)
  }
  return { data, errors }
}

// Like the form: an Eingabe without a place keeps no location.
function dropUnusedLocation(slug: AllowedSurveySlugs, data: Answers) {
  const enableLocation = data[getQuestionIdBySurveySlug(slug, "enableLocation")]
  if (enableLocation === "nein" || String(enableLocation) === "2") {
    delete data[getQuestionIdBySurveySlug(slug, "location")]
  }
}

type SurveyResponseCreateItem = {
  projectSlug: string
  surveySlug: string
  part1?: Answers
  part2: Answers
  part3?: Answers
  status?: string
  source?: SurveyResponseSourceEnum
}

export async function createSurveyResponsesForMcp(input: {
  items: SurveyResponseCreateItem[]
  origin: string
  createdById: number
}) {
  const results = []
  for (const item of input.items) {
    const failed = (errors: string[]) => ({
      projectSlug: item.projectSlug,
      surveySlug: item.surveySlug,
      id: null,
      referenceId: null,
      url: null,
      created: false,
      errors,
    })
    try {
      const project = await requireMcpDirectProject(
        item.projectSlug,
        new Date(),
        "Creating Eingaben",
      )
      const survey = await surveyOfProject(project.id, item.surveySlug)
      const config = requireSurveyConfig(survey.slug)
      if (item.status && !config.statuses.some((status) => status.value === item.status)) {
        throw new Error(`Unbekannter Status: ${item.status}`)
      }

      const errors: string[] = []
      const dataByPart = new Map<number, Answers>()
      for (const [part, answers] of [
        [1, item.part1],
        [2, item.part2],
        [3, item.part3],
      ] as const) {
        if (!answers) continue
        const fields = config.fieldsByPart.get(part) ?? []
        if (fields.length === 0) {
          errors.push(`Teil ${part} gibt es in dieser Beteiligung nicht`)
          continue
        }
        const checked = partData(survey.slug, part, fields, answers)
        errors.push(...checked.errors)
        dataByPart.set(part, checked.data)
      }
      const eingabeData = dataByPart.get(2)
      if (errors.length > 0 || !eingabeData) {
        results.push(failed(errors))
        continue
      }
      dropUnusedLocation(config.slug, eingabeData)

      const defaultStatus = config.statuses[0].value
      const source = item.source ?? SurveyResponseSourceEnum.FORM
      const id = await db.$transaction(async (tx) => {
        if (survey.slug === "ohv-haltestellenfoerderung") {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(${survey.id})`
          eingabeData.referenceId = await createNextOhvReferenceId(survey.id, tx)
        }
        const session = await tx.surveySession.create({
          data: { surveyId: survey.id },
          select: { id: true },
        })
        const createPart = (part: number, data: Answers, status: string) =>
          tx.surveyResponse.create({
            data: {
              surveySessionId: session.id,
              surveyPart: part,
              data: JSON.stringify(data),
              source,
              status,
              state: SurveyResponseStateEnum.SUBMITTED,
            },
            select: { id: true },
          })
        const part1 = dataByPart.get(1)
        if (part1) await createPart(1, part1, defaultStatus)
        const eingabe = await createPart(2, eingabeData, item.status ?? defaultStatus)
        const part3 = dataByPart.get(3)
        if (part3) await createPart(3, part3, defaultStatus)
        return eingabe.id
      })

      await createLogEntry({
        action: "CREATE",
        message: `Eingabe ${id} wurde angelegt.`,
        userId: input.createdById,
        projectId: project.id,
        surveyId: survey.id,
        surveyResponseId: id,
      })
      results.push({
        projectSlug: project.slug,
        surveySlug: survey.slug,
        id,
        referenceId: typeof eingabeData.referenceId === "string" ? eingabeData.referenceId : null,
        url: responseUrl(input.origin, project.slug, survey.id, id),
        created: true,
        errors: [] as string[],
      })
    } catch (error) {
      results.push(failed([error instanceof Error ? error.message : String(error)]))
    }
  }
  return {
    environment: mcpEnvLabel(process.env.VITE_APP_ENV),
    returned: results.length,
    createdCount: results.filter((result) => result.created).length,
    items: results,
  }
}
