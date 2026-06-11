import { z } from "zod"
import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { AllowedSurveySlugsSchema } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { getFlatSurveyFormFields } from "@/src/components/surveys/[surveyId]/responses/getFlatSurveyFormFields"
import { SurveyResponseStateEnum } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { connectIds, idsFromFormValue, setIds } from "@/src/shared/prisma/connectIds"
import { m2mFields, type M2MFieldsType } from "./m2mFields"
import { SurveyResponseFormSchema } from "./schemas"
import {
  CreateSurveyResponseBySlugSchema,
  DeleteSurveyResponseBySlugSchema,
  DeleteTestSurveyResponsesSchema,
  GetCreatedSurveyResponsesSchema,
  GetFeedbackSurveyResponsesSchema,
  GetGroupedSurveyResponsesSchema,
  GetLinkedSurveyResponseForSubsubsectionSchema,
  GetSurveyResponseSchema,
  GetSurveyResponsesSchema,
  GetTestSurveyResponsesSchema,
  PatchSurveyResponseSchema,
  UpdateSurveyResponseBySlugSchema,
} from "./surveyResponses.inputSchemas"

export type GetSurveyResponsesInput = z.infer<typeof GetSurveyResponsesSchema>
export type GetFeedbackSurveyResponsesInput = z.infer<typeof GetFeedbackSurveyResponsesSchema>
export type GetGroupedSurveyResponsesInput = z.infer<typeof GetGroupedSurveyResponsesSchema>
type SurveyResponseJsonData = Record<string, string | number | boolean | null>
type SurveyResponseInput = z.infer<typeof SurveyResponseFormSchema>

function surveyResponseInProjectWhere(projectSlug: string, id: number) {
  return { id, surveySession: { survey: { project: { slug: projectSlug } } } }
}

async function validateSurveyResponseRelations(projectSlug: string, input: SurveyResponseInput) {
  const topicIds = idsFromFormValue(input.surveyResponseTopics)

  await Promise.all([
    db.surveySession.findFirstOrThrow({
      where: { id: input.surveySessionId, survey: { project: { slug: projectSlug } } },
      select: { id: true },
    }),
    input.operatorId
      ? db.operator.findFirstOrThrow({
          where: { id: input.operatorId, project: { slug: projectSlug } },
          select: { id: true },
        })
      : undefined,
    topicIds.length
      ? db.surveyResponseTopic
          .findMany({
            where: { id: { in: topicIds }, project: { slug: projectSlug } },
            select: { id: true },
          })
          .then((records) => {
            if (records.length !== topicIds.length) throw new Error("Invalid survey response topic")
          })
      : undefined,
  ])
}

function surveyResponseData(input: SurveyResponseInput) {
  const { surveyResponseTopics, ...data } = input

  return {
    ...data,
    surveyResponseTopics: connectIds(idsFromFormValue(surveyResponseTopics)),
  }
}

function surveyResponseUpdateData(input: SurveyResponseInput) {
  const { surveyResponseTopics, ...data } = input

  return {
    ...data,
    surveyResponseTopics: setIds(idsFromFormValue(surveyResponseTopics)),
  }
}

export async function getSurveyResponses(
  headers: Headers,
  input: z.infer<typeof GetSurveyResponsesSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  return db.surveyResponse.findMany({
    include: {
      operator: true,
      surveyResponseComments: { include: { author: true }, orderBy: { id: "asc" } },
      surveyResponseTopics: true,
      uploads: true,
    },
    orderBy: { id: "desc" },
    where: {
      surveySession: {
        survey: {
          project: { slug: input.projectSlug },
          ...(input.surveyId ? { id: input.surveyId } : {}),
        },
      },
    },
  })
}

export async function getSurveyResponse(
  headers: Headers,
  input: z.infer<typeof GetSurveyResponseSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  return db.surveyResponse.findFirstOrThrow({
    include: {
      operator: true,
      surveyResponseComments: { include: { author: true }, orderBy: { id: "asc" } },
      surveyResponseTopics: true,
      uploads: true,
    },
    where: surveyResponseInProjectWhere(input.projectSlug, input.id),
  })
}

export async function createSurveyResponse(
  headers: Headers,
  input: z.infer<typeof CreateSurveyResponseBySlugSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { projectSlug, ...data } = input
  await validateSurveyResponseRelations(projectSlug, data)

  return db.surveyResponse.create({
    data: surveyResponseData(data),
  })
}

export async function updateSurveyResponse(
  headers: Headers,
  input: z.infer<typeof UpdateSurveyResponseBySlugSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug, ...data } = input
  await validateSurveyResponseRelations(projectSlug, data)
  const previous = await db.surveyResponse.findFirstOrThrow({
    where: surveyResponseInProjectWhere(projectSlug, id),
    select: { id: true },
  })

  return db.surveyResponse.update({
    where: { id: previous.id },
    data: surveyResponseUpdateData(data),
  })
}

export async function deleteSurveyResponse(
  headers: Headers,
  input: z.infer<typeof DeleteSurveyResponseBySlugSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)

  return db.surveyResponse.deleteMany({
    where: surveyResponseInProjectWhere(input.projectSlug, input.id),
  })
}

export async function patchSurveyResponse(
  headers: Headers,
  input: z.infer<typeof PatchSurveyResponseSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug, ...data } = input

  await db.surveyResponse.findFirstOrThrow({
    where: surveyResponseInProjectWhere(projectSlug, id),
    select: { id: true },
  })

  const disconnect: Partial<Record<M2MFieldsType, { set: [] }>> = {}
  const connect: Partial<Record<M2MFieldsType, { connect: { id: number }[] }>> = {}

  m2mFields.forEach((fieldName) => {
    if (typeof data[fieldName] === "undefined") return

    disconnect[fieldName] = { set: [] }
    connect[fieldName] = {
      connect: Array.isArray(data[fieldName])
        ? data[fieldName].map((topicId) => ({ id: topicId }))
        : [],
    }
    delete data[fieldName]
  })

  if (Object.keys(disconnect).length > 0) {
    await db.surveyResponse.update({
      where: { id },
      data: disconnect,
    })
  }

  return db.surveyResponse.update({
    where: { id },
    // @ts-expect-error m2m connect fields are validated at runtime
    data: { ...data, ...connect },
  })
}

export async function getFeedbackSurveyResponsesWithSurveyDataAndComments(
  headers: Headers,
  input: GetFeedbackSurveyResponsesInput,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const { projectSlug, surveyId } = input

  const rawSurveyResponsePart2 = await db.surveyResponse.findMany({
    where: {
      state: SurveyResponseStateEnum.SUBMITTED,
      surveySession: {
        survey: { project: { slug: projectSlug } },
        surveyId,
      },
      surveyPart: 2,
    },
    orderBy: { id: "desc" },
    include: {
      operator: { select: { id: true, title: true, slug: true } },
      surveyResponseTopics: true,
      surveySession: { include: { survey: { select: { slug: true, id: true } } } },
      surveyResponseComments: {
        select: {
          id: true,
          surveyResponseId: true,
          createdAt: true,
          updatedAt: true,
          body: true,
          author: {
            select: {
              id: true,
              role: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  })

  const rawSurveyResponsePart1 = await db.surveyResponse.findMany({
    where: {
      surveySession: {
        survey: { project: { slug: projectSlug } },
        surveyId,
      },
      surveyPart: 1,
    },
  })

  const rawSurveyResponsePart3 = await db.surveyResponse.findMany({
    where: {
      surveySession: {
        survey: { project: { slug: projectSlug } },
        surveyId,
      },
      surveyPart: 3,
    },
  })

  const additionalFilters = rawSurveyResponsePart2.length
    ? getConfigBySurveySlug(
        rawSurveyResponsePart2[0]?.surveySession.survey.slug as AllowedSurveySlugs,
        "backend",
      )?.additionalFilters
    : []
  const surveySlug = rawSurveyResponsePart2[0]?.surveySession.survey.slug as
    | AllowedSurveySlugs
    | undefined
  const part1Fields = getFlatSurveyFormFields(
    surveySlug ? getConfigBySurveySlug(surveySlug, "part1") : null,
  )
  const part2Fields = getFlatSurveyFormFields(
    surveySlug ? getConfigBySurveySlug(surveySlug, "part2") : null,
  )
  const part3Fields = getFlatSurveyFormFields(
    surveySlug ? getConfigBySurveySlug(surveySlug, "part3") : null,
  )

  const rawSurveyResponsePart2WithPart1AndPart3Responses = rawSurveyResponsePart2.map(
    (responsePart2) => {
      const surveyPart1ResponseData = rawSurveyResponsePart1.find(
        (responsePart1) => responsePart1.surveySessionId === responsePart2.surveySessionId,
      )?.data
      const surveyPart3ResponseData = rawSurveyResponsePart3.find(
        (responsePart3) => responsePart3.surveySessionId === responsePart2.surveySessionId,
      )?.data
      return { ...responsePart2, surveyPart1ResponseData, surveyPart3ResponseData }
    },
  )

  const parsedAndSorted = rawSurveyResponsePart2WithPart1AndPart3Responses
    .map((response) => {
      const data = JSON.parse(response.data) as SurveyResponseJsonData
      const surveyResponseTopics = response.surveyResponseTopics.map((topic) => topic.id)
      const surveyPart1ResponseData = response.surveyPart1ResponseData
        ? (JSON.parse(response.surveyPart1ResponseData) as SurveyResponseJsonData)
        : null
      const surveyPart3ResponseData = response.surveyPart3ResponseData
        ? (JSON.parse(response.surveyPart3ResponseData) as SurveyResponseJsonData)
        : null
      return {
        ...response,
        data,
        surveyResponseTopics,
        surveyPart1ResponseData,
        surveyPart3ResponseData,
      }
    })
    .sort((a, b) => b.id - a.id)

  const additionalFilterQuestionsWithResponseOptions = additionalFilters?.map((question) => {
    const field =
      question.surveyPart === "part1"
        ? part1Fields.find((f) => String(f.name) === String(question.id))
        : question.surveyPart === "part3"
          ? part3Fields.find((f) => String(f.name) === String(question.id))
          : part2Fields.find((f) => String(f.name) === String(question.id))
    const questionDatas = parsedAndSorted
      .map((responseItem) => {
        let result: string | null
        if (question.surveyPart === "part1") {
          result = responseItem.surveyPart1ResponseData
            ? String(responseItem.surveyPart1ResponseData[String(question.id)] ?? "")
            : null
        } else if (question.surveyPart === "part3") {
          result = responseItem.surveyPart3ResponseData
            ? String(responseItem.surveyPart3ResponseData[String(question.id)] ?? "")
            : null
        } else {
          result = String(responseItem.data[String(question.id)] ?? "")
        }
        return result
      })
      .filter(Boolean)
    let uniqueSortedResponseOptions = Array.from(new Set(questionDatas))
      .sort()
      .map((option) => {
        const fieldProps = field?.props as
          | { options?: Array<{ key: string | number; label: string }> }
          | undefined
        const fieldOptions: Array<{ key: string | number; label: string }> = Array.isArray(
          fieldProps?.options,
        )
          ? fieldProps.options
          : []
        const label =
          fieldOptions.find((opt) => String(opt.key) === String(option))?.label || option
        return { value: option, label }
      })

    uniqueSortedResponseOptions = [{ value: "ALL", label: "Alle" }, ...uniqueSortedResponseOptions]
    return { ...question, options: uniqueSortedResponseOptions }
  })

  return {
    feedbackSurveyResponses: parsedAndSorted,
    additionalFilterQuestionsWithResponseOptions,
  }
}

export async function getGroupedSurveyResponses(
  headers: Headers,
  input: GetGroupedSurveyResponsesInput,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const { projectSlug, surveyId } = input

  const surveySessions = await db.surveySession.findMany({
    where: {
      survey: { project: { slug: projectSlug } },
      surveyId,
    },
    orderBy: { id: "desc" },
    take: 1000,
    include: { responses: true, survey: true },
  })

  const surveyResponsesFirstPart = surveySessions
    .flatMap((session) => session.responses)
    .filter((response) => response.surveyPart === 1)
    .filter((response) => response.state === SurveyResponseStateEnum.SUBMITTED)
    .sort((a, b) => a.id - b.id)

  const surveyResponsesFeedbackPart = surveySessions
    .flatMap((session) => session.responses)
    .filter((response) => response.surveyPart === 2)
    .filter((response) => response.state === SurveyResponseStateEnum.SUBMITTED)
    .sort((a, b) => b.id - a.id)

  const groupedSurveyResponsesFirstPart: Record<string, Record<string, number>> = {}

  const parsedSurvey = AllowedSurveySlugsSchema.safeParse(surveySessions[0]?.survey)
  const responseTemplate = parsedSurvey.success
    ? getFlatSurveyFormFields(getConfigBySurveySlug(parsedSurvey.data.slug, "part1")).map(
        (question) => question.name,
      )
    : []

  if (responseTemplate.length && surveyResponsesFirstPart.length) {
    responseTemplate.forEach((responseKey) => {
      const result: Record<number, number> = {}
      surveyResponsesFirstPart.forEach((response) => {
        const responseObject = JSON.parse(response.data) as Record<string, number | number[]>
        if (
          typeof responseObject[responseKey] === "number" ||
          typeof responseObject[responseKey] === "string"
        ) {
          const key = responseObject[responseKey] as number
          result[key] ||= 0
          result[key] += 1
        }
        if (Array.isArray(responseObject[responseKey])) {
          responseObject[responseKey].forEach((responseKeyItem: number) => {
            result[responseKeyItem] ||= 0
            result[responseKeyItem] += 1
          })
        }
      })
      groupedSurveyResponsesFirstPart[responseKey] = result
    })
  }

  return {
    groupedSurveyResponsesFirstPart,
    surveyResponsesFeedbackPart,
    surveySessions,
    hasMore: false as const,
    count: surveySessions.length,
  }
}

export type GetCreatedSurveyResponsesInput = z.infer<typeof GetCreatedSurveyResponsesSchema>

export async function getCreatedSurveyResponses(
  headers: Headers,
  input: z.infer<typeof GetCreatedSurveyResponsesSchema>,
) {
  await endpointAuth.admin(headers)

  return db.surveyResponse.findMany({
    where: {
      state: SurveyResponseStateEnum.CREATED,
      surveySession: { survey: { slug: input.slug as AllowedSurveySlugs } },
    },
    include: {
      surveySession: true,
    },
    orderBy: { id: "desc" },
  })
}

export type GetTestSurveyResponsesInput = z.infer<typeof GetTestSurveyResponsesSchema>

export async function getTestSurveyResponses(
  headers: Headers,
  input: z.infer<typeof GetTestSurveyResponsesSchema>,
) {
  await endpointAuth.admin(headers)

  const userFeedbackTextQuestionId = getQuestionIdBySurveySlug(input.slug, "feedbackText")

  const surveySessions = await db.surveySession.findMany({
    where: { survey: { slug: input.slug } },
    include: { responses: true },
  })

  let filteredSurveyResponses: (typeof surveySessions)[number]["responses"] = []

  for (const { responses } of surveySessions) {
    if (
      responses.some((response) => {
        const data = JSON.parse(response.data) as Record<string, unknown>
        return (
          (response.surveyPart === 2 &&
            typeof data[userFeedbackTextQuestionId] === "string" &&
            data[userFeedbackTextQuestionId].substring(0, 20).toLowerCase().includes("test")) ||
          (response.surveyPart === 1 &&
            input.slug === "radnetz-brandenburg" &&
            data[5] === "FixMyCity")
        )
      })
    ) {
      filteredSurveyResponses = [...filteredSurveyResponses, ...responses]
    }
  }

  return filteredSurveyResponses
}

export async function deleteTestSurveyResponses(
  headers: Headers,
  input: z.infer<typeof DeleteTestSurveyResponsesSchema>,
) {
  await endpointAuth.admin(headers)
  const { deleteIds } = input

  await db.surveyResponse.deleteMany({ where: { id: { in: deleteIds } } })
  await db.surveySession.deleteMany({
    where: { responses: { some: { id: { in: deleteIds } } } },
  })
}

export type GetLinkedSurveyResponseForSubsubsectionInput = z.infer<
  typeof GetLinkedSurveyResponseForSubsubsectionSchema
>

export async function getLinkedSurveyResponseForSubsubsection(
  headers: Headers,
  input: GetLinkedSurveyResponseForSubsubsectionInput,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  if (input.projectSlug !== "ohv") return null

  const normalizedSubsubsectionSlug = input.subsubsectionSlug.toLowerCase()

  const responses = await db.surveyResponse.findMany({
    where: {
      state: SurveyResponseStateEnum.SUBMITTED,
      surveyPart: 2,
      surveySession: {
        survey: {
          project: { slug: input.projectSlug },
          slug: "ohv-haltestellenfoerderung",
        },
      },
    },
    select: {
      id: true,
      data: true,
      surveySession: {
        select: {
          surveyId: true,
          survey: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
    orderBy: { id: "desc" },
  })

  for (const response of responses) {
    try {
      const data = JSON.parse(response.data) as { referenceId?: unknown }
      if (
        typeof data.referenceId === "string" &&
        data.referenceId.toLowerCase() === normalizedSubsubsectionSlug
      ) {
        return {
          surveyResponseId: response.id,
          surveyId: response.surveySession.surveyId,
          surveySlug: response.surveySession.survey.slug,
        }
      }
    } catch {
      // ignore invalid legacy JSON and keep scanning
    }
  }

  return null
}
