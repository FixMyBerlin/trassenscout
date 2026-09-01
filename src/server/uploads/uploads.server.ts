import type { z } from "zod"
import { AllowedSurveySlugsSchema } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { isImageMimeType } from "@/src/components/core/uploads/isImageUpload"
import { NumberArraySchema } from "@/src/components/core/utils/schema-shared"
import type { Prisma } from "@/src/prisma/generated/browser"
import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { relationIds } from "@/src/server/logEntries/create/relationIds"
import {
  loadUserRedactionContext,
  redactUploadUsers,
} from "@/src/server/memberships/redactFormerProjectMemberUser.server"
import { projectRecordDetailVisibilityWhere } from "@/src/server/projectRecords/projectRecordVisibility.server"
import { AuthorizationError } from "@/src/shared/auth/errors"
import {
  connectIds,
  connectIdsIfAny,
  idsFromFormValue,
  setIds,
} from "@/src/shared/prisma/connectIds"
import { UploadSchema } from "@/src/shared/uploads/schemas"
import {
  deleteUploadFileAndDbRecord,
  deleteUploadStoredFiles,
} from "./_utils/deleteUploadFileAndDbRecord"
import { extractExifFromS3 } from "./_utils/extractExifFromS3.server"
import { findFilenameCollisions } from "./_utils/filenameCollisions"
import { isProjectUploadS3Url } from "./_utils/keys"
import { matchSlugFromFilename } from "./_utils/matchSlugFromFilename"
import {
  replaceableUploadWhere,
  uploadForDeletionSelect,
  uploadWithSubsectionsInclude,
} from "./_utils/uploadInclude"
import type { GetSurveyResponseUploadsSplitInput } from "./uploads.inputSchemas"
import {
  CheckUploadFilenameCollisionsSchema,
  CreateUploadSchema,
  DeleteUploadSchema,
  GetUploadSchema,
  GetUploadsSchema,
  GetUploadsWithSubsectionsSchema,
  ReplaceUploadFileSchema,
  UpdateUploadSchema,
} from "./uploads.inputSchemas"

type UploadInput = z.infer<typeof UploadSchema>
type UploadRelationsInput = Pick<
  UploadInput,
  | "projectRecordEmailId"
  | "surveyResponseId"
  | "projectRecords"
  | "subsubsections"
  | "acquisitionAreas"
  | "tags"
>
type UpdateUploadDataInput = Omit<UploadInput, "externalUrl">

function uploadInProjectWhere(projectSlug: string, id: number) {
  return { id, project: { slug: projectSlug } }
}

async function validateUploadRelations(
  projectSlug: string,
  input: UploadRelationsInput,
  viewerRecordVisibility?: { canEdit: boolean; aiEnabled: boolean },
) {
  const projectRecordIds = idsFromFormValue(input.projectRecords)
  const subsubsectionIds = idsFromFormValue(input.subsubsections)
  const acquisitionAreaIds = idsFromFormValue(input.acquisitionAreas)
  const tagIds = idsFromFormValue(input.tags)
  const projectRecordVisibilityWhere = viewerRecordVisibility
    ? projectRecordDetailVisibilityWhere(
        viewerRecordVisibility.aiEnabled,
        viewerRecordVisibility.canEdit,
      )
    : {}

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
            where: {
              id: { in: projectRecordIds },
              project: { slug: projectSlug },
              ...projectRecordVisibilityWhere,
            },
            select: { id: true },
          })
          .then((records) => {
            if (records.length !== projectRecordIds.length) {
              if (viewerRecordVisibility) throw new AuthorizationError()
              throw new Error("Invalid project record")
            }
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

function updateUploadData(input: UpdateUploadDataInput, projectId: number, userId: number) {
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

/** Images carry their own coordinates; read them from the freshly stored object. */
async function exifCoordinates(input: { mimeType?: string | null; externalUrl: string }) {
  if (!isImageMimeType(input.mimeType)) return null
  return extractExifFromS3(input.externalUrl)
}

function viewerCreateUploadHasNoExtraFields(input: UploadInput) {
  return (
    (input.summary == null || input.summary.trim() === "") &&
    input.projectRecordEmailId == null &&
    input.latitude == null &&
    input.longitude == null &&
    input.collaborationUrl == null &&
    input.collaborationPath == null &&
    idsFromFormValue(input.subsubsections).length === 0 &&
    idsFromFormValue(input.acquisitionAreas).length === 0 &&
    idsFromFormValue(input.tags).length === 0
  )
}

function assertViewerCreateUploadAllowed(input: UploadInput) {
  const projectRecordIds = idsFromFormValue(input.projectRecords)
  const isSurveyOnly =
    input.surveyResponseId != null &&
    projectRecordIds.length === 0 &&
    viewerCreateUploadHasNoExtraFields(input)
  const isProjectRecordOnly =
    projectRecordIds.length === 1 &&
    input.surveyResponseId == null &&
    viewerCreateUploadHasNoExtraFields(input)

  if (!isSurveyOnly && !isProjectRecordOnly) {
    throw new AuthorizationError()
  }
}

function assertUploadExternalUrlBelongsToProject(projectSlug: string, externalUrl: string) {
  if (!isProjectUploadS3Url(externalUrl, projectSlug)) {
    throw new AuthorizationError()
  }
}

export async function getUploads(headers: Headers, input: z.infer<typeof GetUploadsSchema>) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const uploads = await db.upload.findMany({
    include: uploadWithSubsectionsInclude,
    orderBy: { id: "desc" },
    where: { project: { slug: input.projectSlug } },
  })
  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  return uploads.map((upload) => redactUploadUsers(upload, redactionContext))
}

export async function getUploadsWithSubsections(
  headers: Headers,
  input: z.infer<typeof GetUploadsWithSubsectionsSchema>,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
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
  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )

  return {
    uploads: uploads.map((upload) => redactUploadUsers(upload, redactionContext)),
    hasMore: skip + uploads.length < count,
    count,
  }
}

export async function getUpload(headers: Headers, input: z.infer<typeof GetUploadSchema>) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const upload = await db.upload.findFirstOrThrow({
    include: uploadWithSubsectionsInclude,
    where: uploadInProjectWhere(input.projectSlug, input.id),
  })
  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  return redactUploadUsers(upload, redactionContext)
}

export async function createUpload(headers: Headers, input: z.infer<typeof CreateUploadSchema>) {
  const { projectId, membershipRole, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const { projectSlug, assignSubsubsectionFromFilename, ...data } = input
  const canEdit = membershipRole === null || editorRoles.includes(membershipRole)

  assertUploadExternalUrlBelongsToProject(projectSlug, data.externalUrl)

  if (!canEdit) {
    if (assignSubsubsectionFromFilename) {
      throw new AuthorizationError()
    }
    assertViewerCreateUploadAllowed(data)
  }

  const projectRecordIds = idsFromFormValue(data.projectRecords)
  let viewerRecordVisibility: { canEdit: boolean; aiEnabled: boolean } | undefined
  if (!canEdit && projectRecordIds.length === 1) {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { aiEnabled: true },
    })
    viewerRecordVisibility = {
      canEdit: false,
      aiEnabled: project?.aiEnabled ?? false,
    }
  }

  await validateUploadRelations(projectSlug, data, viewerRecordVisibility)

  if (assignSubsubsectionFromFilename && idsFromFormValue(data.subsubsections).length === 0) {
    // `title` still holds the original filename at creation time (the dropzone sets
    // `title: file.name`); the externalUrl filename is sanitizeKey-mangled.
    const matchedId = await matchSubsubsectionIdFromFilename(projectSlug, data.title)
    if (matchedId) data.subsubsections = [matchedId]
  }

  if (data.latitude == null && data.longitude == null) {
    const exif = await exifCoordinates(data)
    if (exif) {
      data.latitude = exif.latitude
      data.longitude = exif.longitude
    }
  }

  const upload = await db.upload.create({
    data: createUploadData(data, projectId, Number(session.userId)),
    include: uploadWithSubsectionsInclude,
  })

  const parentMessages: string[] = []
  for (const subsubsection of upload.subsubsections ?? []) {
    parentMessages.push(`zur Maßnahme ${frenchQuote(shortTitle(subsubsection.slug))}`)
  }
  for (const projectRecord of upload.projectRecords ?? []) {
    parentMessages.push(`zum Protokolleintrag ${frenchQuote(projectRecord.title)}`)
  }
  for (const acquisitionArea of upload.acquisitionAreas ?? []) {
    parentMessages.push(`zur Erwerbsfläche ${acquisitionArea.parcel.alkisParcelId}`)
  }
  const parentSuffix = parentMessages.length > 0 ? ` ${parentMessages.join(" und ")}` : ""

  await createLogEntry({
    action: "CREATE",
    message: `Neues Dokument ${frenchQuote(upload.title)}${parentSuffix} wurde hinzugefügt.`,
    userId: Number(session.userId),
    projectSlug,
    uploadId: upload.id,
    updatedRecord: {
      id: upload.id,
      title: upload.title,
      summary: upload.summary,
      externalUrl: upload.externalUrl,
      mimeType: upload.mimeType,
      fileSize: upload.fileSize,
      latitude: upload.latitude,
      longitude: upload.longitude,
      collaborationUrl: upload.collaborationUrl,
      collaborationPath: upload.collaborationPath,
      projectRecordEmailId: upload.projectRecordEmailId,
      surveyResponseId: upload.surveyResponseId,
      projectRecordIds: relationIds(upload.projectRecords),
      subsubsectionIds: relationIds(upload.subsubsections),
      acquisitionAreaIds: relationIds(upload.acquisitionAreas),
      tagIds: relationIds(upload.tags),
    },
  })

  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  return redactUploadUsers(upload, redactionContext)
}

async function matchSubsubsectionIdFromFilename(projectSlug: string, filename: string) {
  const subsubsections = await db.subsubsection.findMany({
    where: { subsection: { project: { slug: projectSlug } } },
    select: { id: true, slug: true, subsection: { select: { slug: true } } },
  })
  const match = matchSlugFromFilename(
    filename,
    subsubsections.map((s) => ({
      subsubsectionId: s.id,
      subsectionSlug: s.subsection.slug,
      subsubsectionSlug: s.slug,
    })),
  )
  return match.kind === "matched" ? match.pair.subsubsectionId : null
}

export async function updateUpload(headers: Headers, input: z.infer<typeof UpdateUploadSchema>) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
  )
  const { id, projectSlug, externalUrl: _keepStoredExternalUrl, ...data } = input
  await validateUploadRelations(projectSlug, data)
  const previousUpload = await db.upload.findFirstOrThrow({
    where: uploadInProjectWhere(projectSlug, id),
    select: {
      id: true,
      title: true,
      summary: true,
      externalUrl: true,
      mimeType: true,
      fileSize: true,
      latitude: true,
      longitude: true,
      collaborationUrl: true,
      collaborationPath: true,
      projectRecordEmailId: true,
      surveyResponseId: true,
      projectRecords: { select: { id: true } },
      subsubsections: { select: { id: true } },
      acquisitionAreas: { select: { id: true } },
      tags: { select: { id: true } },
    },
  })

  const upload = await db.upload.update({
    where: { id: previousUpload.id },
    data: updateUploadData(data, projectId, Number(session.userId)),
    include: uploadWithSubsectionsInclude,
  })
  await createLogEntry({
    action: "UPDATE",
    message: `Dokument ${frenchQuote(upload.title)} wurde bearbeitet.`,
    userId: Number(session.userId),
    projectSlug,
    previousRecord: {
      id: previousUpload.id,
      title: previousUpload.title,
      summary: previousUpload.summary,
      externalUrl: previousUpload.externalUrl,
      mimeType: previousUpload.mimeType,
      fileSize: previousUpload.fileSize,
      latitude: previousUpload.latitude,
      longitude: previousUpload.longitude,
      collaborationUrl: previousUpload.collaborationUrl,
      collaborationPath: previousUpload.collaborationPath,
      projectRecordEmailId: previousUpload.projectRecordEmailId,
      surveyResponseId: previousUpload.surveyResponseId,
      projectRecordIds: relationIds(previousUpload.projectRecords),
      subsubsectionIds: relationIds(previousUpload.subsubsections),
      acquisitionAreaIds: relationIds(previousUpload.acquisitionAreas),
      tagIds: relationIds(previousUpload.tags),
    },
    updatedRecord: {
      id: upload.id,
      title: upload.title,
      summary: upload.summary,
      externalUrl: upload.externalUrl,
      mimeType: upload.mimeType,
      fileSize: upload.fileSize,
      latitude: upload.latitude,
      longitude: upload.longitude,
      collaborationUrl: upload.collaborationUrl,
      collaborationPath: upload.collaborationPath,
      projectRecordEmailId: upload.projectRecordEmailId,
      surveyResponseId: upload.surveyResponseId,
      projectRecordIds: relationIds(upload.projectRecords),
      subsubsectionIds: relationIds(upload.subsubsections),
      acquisitionAreaIds: relationIds(upload.acquisitionAreas),
      tagIds: relationIds(upload.tags),
    },
    uploadId: upload.id,
  })

  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  return redactUploadUsers(upload, redactionContext)
}

export async function checkUploadFilenameCollisions(
  headers: Headers,
  input: z.infer<typeof CheckUploadFilenameCollisionsSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const existing = await db.upload.findMany({
    where: { project: { slug: input.projectSlug }, ...replaceableUploadWhere },
    select: { id: true, externalUrl: true, title: true },
  })

  return {
    collisions: findFilenameCollisions(input.filenames, existing).map((collision) => ({
      filename: collision.filename,
      existingUpload: {
        id: collision.existingUpload.id,
        title: collision.existingUpload.title,
        filename: collision.existingUpload.filename,
      },
    })),
  }
}

export async function replaceUploadFile(
  headers: Headers,
  input: z.infer<typeof ReplaceUploadFileSchema>,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
  )
  const {
    id,
    projectSlug,
    acquisitionAreas,
    projectRecordEmailId,
    projectRecords,
    subsubsections,
    surveyResponseId,
    tags,
    ...data
  } = input

  assertUploadExternalUrlBelongsToProject(projectSlug, data.externalUrl)

  const [previousUpload, , exif] = await Promise.all([
    db.upload.findFirstOrThrow({
      where: { ...uploadInProjectWhere(projectSlug, id), ...replaceableUploadWhere },
      select: {
        id: true,
        title: true,
        summary: true,
        externalUrl: true,
        mimeType: true,
        fileSize: true,
        latitude: true,
        longitude: true,
        collaborationUrl: true,
        collaborationPath: true,
        projectRecordEmailId: true,
        surveyResponseId: true,
        projectRecords: { select: { id: true } },
        subsubsections: { select: { id: true } },
        acquisitionAreas: { select: { id: true } },
        tags: { select: { id: true } },
      },
    }),
    validateUploadRelations(projectSlug, {
      acquisitionAreas,
      projectRecordEmailId: projectRecordEmailId ?? null,
      projectRecords,
      subsubsections,
      surveyResponseId: surveyResponseId ?? null,
      tags,
    }),
    exifCoordinates(data),
  ])

  const upload = await db.upload.update({
    where: { id: previousUpload.id },
    data: {
      ...data,
      updatedById: Number(session.userId),
      // The file is a different one now, so anything derived from the old content goes.
      summary: null,
      collaborationPath: null,
      collaborationUrl: null,
      latitude: exif?.latitude ?? null,
      longitude: exif?.longitude ?? null,
      acquisitionAreas: connectIdsIfAny(acquisitionAreas),
      projectRecordEmailId: projectRecordEmailId || undefined,
      projectRecords: connectIdsIfAny(projectRecords),
      subsubsections: connectIdsIfAny(subsubsections),
      surveyResponseId: surveyResponseId || undefined,
      tags: connectIdsIfAny(tags),
    },
    include: uploadWithSubsectionsInclude,
  })

  await createLogEntry({
    action: "UPDATE",
    message: `Datei des Dokuments ${frenchQuote(upload.title)} wurde ersetzt.`,
    userId: Number(session.userId),
    projectSlug,
    previousRecord: {
      id: previousUpload.id,
      title: previousUpload.title,
      summary: previousUpload.summary,
      externalUrl: previousUpload.externalUrl,
      mimeType: previousUpload.mimeType,
      fileSize: previousUpload.fileSize,
      latitude: previousUpload.latitude,
      longitude: previousUpload.longitude,
      collaborationUrl: previousUpload.collaborationUrl,
      collaborationPath: previousUpload.collaborationPath,
      projectRecordEmailId: previousUpload.projectRecordEmailId,
      surveyResponseId: previousUpload.surveyResponseId,
      projectRecordIds: relationIds(previousUpload.projectRecords),
      subsubsectionIds: relationIds(previousUpload.subsubsections),
      acquisitionAreaIds: relationIds(previousUpload.acquisitionAreas),
      tagIds: relationIds(previousUpload.tags),
    },
    updatedRecord: {
      id: upload.id,
      title: upload.title,
      summary: upload.summary,
      externalUrl: upload.externalUrl,
      mimeType: upload.mimeType,
      fileSize: upload.fileSize,
      latitude: upload.latitude,
      longitude: upload.longitude,
      collaborationUrl: upload.collaborationUrl,
      collaborationPath: upload.collaborationPath,
      projectRecordEmailId: upload.projectRecordEmailId,
      surveyResponseId: upload.surveyResponseId,
      projectRecordIds: relationIds(upload.projectRecords),
      subsubsectionIds: relationIds(upload.subsubsections),
      acquisitionAreaIds: relationIds(upload.acquisitionAreas),
      tagIds: relationIds(upload.tags),
    },
    uploadId: upload.id,
  })

  // Best effort: the record already points at the new object, so a failed cleanup only
  // leaves an orphan behind. The URL check guards against a payload that reuses the
  // stored URL, which would otherwise delete the file the record now points at.
  if (previousUpload.externalUrl !== upload.externalUrl) {
    try {
      await deleteUploadStoredFiles(previousUpload)
    } catch (error) {
      console.warn("Failed to delete replaced upload file:", error)
    }
  }

  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  return redactUploadUsers(upload, redactionContext)
}

export async function deleteUpload(headers: Headers, input: z.infer<typeof DeleteUploadSchema>) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const upload = await db.upload.findFirstOrThrow({
    where: uploadInProjectWhere(input.projectSlug, input.id),
    select: uploadForDeletionSelect,
  })

  await deleteUploadFileAndDbRecord(upload)

  await createLogEntry({
    action: "DELETE",
    message: `Dokument ${frenchQuote(upload.title)} wurde gelöscht.`,
    userId: Number(session.userId),
    projectSlug: input.projectSlug,
    previousRecord: { id: upload.id },
  })

  return { success: true }
}

export async function deleteUploadIfOrphan(
  headers: Headers,
  input: z.infer<typeof DeleteUploadSchema>,
) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const upload = await db.upload.findFirstOrThrow({
    where: uploadInProjectWhere(input.projectSlug, input.id),
    select: {
      id: true,
      title: true,
      collaborationPath: true,
      collaborationUrl: true,
      externalUrl: true,
      projectRecordEmailId: true,
      surveyResponseId: true,
      _count: {
        select: {
          projectRecords: true,
          subsubsections: true,
          acquisitionAreas: true,
          tags: true,
        },
      },
    },
  })

  const hasRelations =
    upload._count.projectRecords > 0 ||
    upload._count.subsubsections > 0 ||
    upload._count.acquisitionAreas > 0 ||
    upload._count.tags > 0 ||
    upload.projectRecordEmailId != null ||
    upload.surveyResponseId != null

  if (hasRelations) {
    return { deleted: false }
  }

  await deleteUploadFileAndDbRecord(upload)

  await createLogEntry({
    action: "DELETE",
    message: `Verwaistes Dokument ${frenchQuote(upload.title)} wurde gelöscht.`,
    userId: Number(session.userId),
    projectSlug: input.projectSlug,
    previousRecord: { id: upload.id },
  })

  return { deleted: true }
}

export async function getSurveyResponseUploadsSplit(
  headers: Headers,
  input: GetSurveyResponseUploadsSplitInput,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
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
  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  const serializedUploads = uploads.map((upload) => redactUploadUsers(upload, redactionContext))

  const data = JSON.parse(surveyResponse.data) as Record<string, unknown>
  const parsedSurveySlug = AllowedSurveySlugsSchema.safeParse({
    slug: surveyResponse.surveySession.survey.slug,
  })
  const uploadsQuestionId = parsedSurveySlug.success
    ? getQuestionIdBySurveySlug(parsedSurveySlug.data.slug, "uploads")
    : undefined

  if (!uploadsQuestionId || !(uploadsQuestionId in data)) {
    return { uploadsInData: [], uploadsNotInData: serializedUploads }
  }

  const rawUploadIds = data[uploadsQuestionId]
  const uploadIdsInData = NumberArraySchema.parse(
    Array.isArray(rawUploadIds) ? rawUploadIds : rawUploadIds ? [rawUploadIds] : [],
  )

  if (uploadIdsInData.length === 0) {
    return { uploadsInData: [], uploadsNotInData: serializedUploads }
  }

  const uploadMap = new Map(serializedUploads.map((upload) => [upload.id, upload]))
  const uploadsInData = uploadIdsInData
    .map((id) => uploadMap.get(id))
    .filter((upload): upload is NonNullable<typeof upload> => upload != null)

  const uploadsInDataIds = new Set(uploadsInData.map((upload) => upload.id))
  const uploadsNotInData = serializedUploads.filter((upload) => !uploadsInDataIds.has(upload.id))

  return {
    uploadsInData,
    uploadsNotInData,
  }
}
