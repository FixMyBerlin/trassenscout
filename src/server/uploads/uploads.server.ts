import type { z } from "zod"
import { AllowedSurveySlugsSchema } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { NumberArraySchema } from "@/src/components/core/utils/schema-shared"
import type { Prisma } from "@/src/prisma/generated/browser"
import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { connectIds, idsFromFormValue, setIds } from "@/src/shared/prisma/connectIds"
import { UploadSchema } from "@/src/shared/uploads/schemas"
import { deleteUploadFileAndDbRecord } from "./_utils/deleteUploadFileAndDbRecord"
import { uploadWithSubsectionsInclude } from "./_utils/uploadInclude"
import type { GetSurveyResponseUploadsSplitInput } from "./uploads.inputSchemas"
import {
  CreateUploadSchema,
  DeleteUploadSchema,
  GetUploadSchema,
  GetUploadsSchema,
  GetUploadsWithSubsectionsSchema,
  UpdateUploadSchema,
} from "./uploads.inputSchemas"

type UploadInput = z.infer<typeof UploadSchema>

function uploadInProjectWhere(projectSlug: string, id: number) {
  return { id, project: { slug: projectSlug } }
}

async function validateUploadRelations(projectSlug: string, input: UploadInput) {
  const projectRecordIds = idsFromFormValue(input.projectRecords)
  const subsubsectionIds = idsFromFormValue(input.subsubsections)
  const acquisitionAreaIds = idsFromFormValue(input.acquisitionAreas)
  const tagIds = idsFromFormValue(input.tags)

  await Promise.all([
    input.projectRecordEmailId
      ? db.projectRecordEmail.findFirstOrThrow({
          where: { id: input.projectRecordEmailId, project: { slug: projectSlug } },
          select: { id: true },
        })
      : undefined,
    input.surveyResponseId
      ? db.surveyResponse.findFirstOrThrow({
          where: {
            id: input.surveyResponseId,
            surveySession: { survey: { project: { slug: projectSlug } } },
          },
          select: { id: true },
        })
      : undefined,
    projectRecordIds.length
      ? db.projectRecord
          .findMany({
            where: { id: { in: projectRecordIds }, project: { slug: projectSlug } },
            select: { id: true },
          })
          .then((records) => {
            if (records.length !== projectRecordIds.length)
              throw new Error("Invalid project record")
          })
      : undefined,
    subsubsectionIds.length
      ? db.subsubsection
          .findMany({
            where: { id: { in: subsubsectionIds }, subsection: { project: { slug: projectSlug } } },
            select: { id: true },
          })
          .then((records) => {
            if (records.length !== subsubsectionIds.length) throw new Error("Invalid subsubsection")
          })
      : undefined,
    acquisitionAreaIds.length
      ? db.acquisitionArea
          .findMany({
            where: {
              id: { in: acquisitionAreaIds },
              subsubsection: { subsection: { project: { slug: projectSlug } } },
            },
            select: { id: true },
          })
          .then((records) => {
            if (records.length !== acquisitionAreaIds.length)
              throw new Error("Invalid acquisition area")
          })
      : undefined,
    tagIds.length
      ? db.tag
          .findMany({
            where: { id: { in: tagIds }, project: { slug: projectSlug } },
            select: { id: true },
          })
          .then((records) => {
            if (records.length !== tagIds.length) throw new Error("Invalid tag")
          })
      : undefined,
  ])
}

function createUploadData(input: UploadInput, projectId: number, userId: number) {
  const { acquisitionAreas, projectRecords, subsubsections, tags, ...data } = input

  return {
    ...data,
    projectId,
    createdById: userId,
    updatedById: userId,
    acquisitionAreas: connectIds(idsFromFormValue(acquisitionAreas)),
    projectRecords: connectIds(idsFromFormValue(projectRecords)),
    subsubsections: connectIds(idsFromFormValue(subsubsections)),
    tags: connectIds(idsFromFormValue(tags)),
  }
}

function updateUploadData(input: UploadInput, projectId: number, userId: number) {
  const { acquisitionAreas, projectRecords, subsubsections, tags, ...data } = input

  return {
    ...data,
    projectId,
    updatedById: userId,
    acquisitionAreas: setIds(idsFromFormValue(acquisitionAreas)),
    projectRecords: setIds(idsFromFormValue(projectRecords)),
    subsubsections: setIds(idsFromFormValue(subsubsections)),
    tags: setIds(idsFromFormValue(tags)),
  }
}

export async function getUploads(headers: Headers, input: z.infer<typeof GetUploadsSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const uploads = await db.upload.findMany({
    include: uploadWithSubsectionsInclude,
    orderBy: { id: "desc" },
    where: { project: { slug: input.projectSlug } },
  })

  return uploads
}

export async function getUploadsWithSubsections(
  headers: Headers,
  input: z.infer<typeof GetUploadsWithSubsectionsSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const { projectSlug, where, orderBy = { id: "desc" }, skip = 0, take = 100 } = input
  const safeWhere: Prisma.UploadWhereInput = {
    project: { slug: projectSlug },
    OR: [
      { projectRecords: { none: {} } },
      {
        projectRecords: {
          some: {
            reviewState: {
              in: [ProjectRecordReviewState.APPROVED, ProjectRecordReviewState.NEEDSREVIEW],
            },
          },
        },
      },
    ],
    ...where,
  }

  const [uploads, count] = await Promise.all([
    db.upload.findMany({
      where: safeWhere,
      orderBy,
      skip,
      take,
      include: uploadWithSubsectionsInclude,
    }),
    db.upload.count({ where: safeWhere }),
  ])

  return {
    uploads,
    hasMore: skip + uploads.length < count,
    count,
  }
}

export async function getUpload(headers: Headers, input: z.infer<typeof GetUploadSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const upload = await db.upload.findFirstOrThrow({
    include: uploadWithSubsectionsInclude,
    where: uploadInProjectWhere(input.projectSlug, input.id),
  })

  return upload
}

export async function createUpload(headers: Headers, input: z.infer<typeof CreateUploadSchema>) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
  )
  const { projectSlug, ...data } = input
  await validateUploadRelations(projectSlug, data)

  return db.upload.create({
    data: createUploadData(data, projectId, Number(session.userId)),
    include: uploadWithSubsectionsInclude,
  })
}

export async function updateUpload(headers: Headers, input: z.infer<typeof UpdateUploadSchema>) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
  )
  const { id, projectSlug, ...data } = input
  await validateUploadRelations(projectSlug, data)
  const previous = await db.upload.findFirstOrThrow({
    where: uploadInProjectWhere(projectSlug, id),
    select: { id: true },
  })

  return db.upload.update({
    where: { id: previous.id },
    data: updateUploadData(data, projectId, Number(session.userId)),
    include: uploadWithSubsectionsInclude,
  })
}

export async function deleteUpload(headers: Headers, input: z.infer<typeof DeleteUploadSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const upload = await db.upload.findFirstOrThrow({
    where: uploadInProjectWhere(input.projectSlug, input.id),
    select: {
      id: true,
      collaborationPath: true,
      collaborationUrl: true,
      externalUrl: true,
    },
  })

  await deleteUploadFileAndDbRecord(upload)
  return { success: true }
}

export async function getSurveyResponseUploadsSplit(
  headers: Headers,
  input: GetSurveyResponseUploadsSplitInput,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const { projectSlug, surveyResponseId } = input

  const surveyResponse = await db.surveyResponse.findFirst({
    where: {
      id: surveyResponseId,
      surveySession: {
        survey: { project: { slug: projectSlug } },
      },
    },
    select: {
      data: true,
      surveySession: { select: { survey: { select: { slug: true } } } },
    },
  })

  if (!surveyResponse) {
    return { uploadsInData: [], uploadsNotInData: [] }
  }

  const uploads = await db.upload.findMany({
    where: {
      project: { slug: projectSlug },
      surveyResponseId,
    },
    orderBy: { id: "desc" },
    include: uploadWithSubsectionsInclude,
  })

  const data = JSON.parse(surveyResponse.data) as Record<string, unknown>
  const parsedSurveySlug = AllowedSurveySlugsSchema.safeParse({
    slug: surveyResponse.surveySession.survey.slug,
  })
  const uploadsQuestionId = parsedSurveySlug.success
    ? getQuestionIdBySurveySlug(parsedSurveySlug.data.slug, "uploads")
    : undefined

  if (!uploadsQuestionId || !(uploadsQuestionId in data)) {
    return { uploadsInData: [], uploadsNotInData: uploads }
  }

  const rawUploadIds = data[uploadsQuestionId]
  const uploadIdsInData = NumberArraySchema.parse(
    Array.isArray(rawUploadIds) ? rawUploadIds : rawUploadIds ? [rawUploadIds] : [],
  )

  if (uploadIdsInData.length === 0) {
    return { uploadsInData: [], uploadsNotInData: uploads }
  }

  const uploadMap = new Map(uploads.map((upload) => [upload.id, upload]))
  const uploadsInData = uploadIdsInData
    .map((id) => uploadMap.get(id))
    .filter((upload): upload is NonNullable<typeof upload> => upload != null)

  const uploadsInDataIds = new Set(uploadsInData.map((upload) => upload.id))
  const uploadsNotInData = uploads.filter((upload) => !uploadsInDataIds.has(upload.id))

  return {
    uploadsInData,
    uploadsNotInData,
  }
}
