import { z } from "zod"
import { ProjectRecordReviewState, ProjectRecordType } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { deleteUploadFileAndDbRecord } from "@/src/server/uploads/_utils/deleteUploadFileAndDbRecord"
import { NotFoundError } from "@/src/shared/auth/errors"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { connectIds, idsFromFormValue, setIds } from "@/src/shared/prisma/connectIds"
import {
  DeleteProjectRecordSchema,
  NewProjectRecordFormSchema,
  ProjectRecordFormSchema,
} from "@/src/shared/projectRecords/schemas"
import { projectRecordInclude } from "./projectRecordInclude"
import { GetProjectRecordAdminSchema } from "./projectRecords.inputSchemas"

export { GetProjectRecordAdminSchema }

export const GetProjectRecordsSchema = ProjectSlugRequiredSchema
export const GetProjectRecordSchema = ProjectSlugRequiredSchema.extend({ id: z.number() })
export const GetProjectRecordsBySubsubsectionSchema = ProjectSlugRequiredSchema.extend({
  subsubsectionId: z.number(),
})
export const GetProjectRecordsByAcquisitionAreaSchema = ProjectSlugRequiredSchema.extend({
  acquisitionAreaId: z.number(),
})
export const CreateProjectRecordBySlugSchema = ProjectSlugRequiredSchema.and(
  NewProjectRecordFormSchema,
)
export const UpdateProjectRecordBySlugSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
}).and(ProjectRecordFormSchema)
export const DeleteProjectRecordBySlugSchema = DeleteProjectRecordSchema
export const DeleteProjectRecordWithUploadsDecisionSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
  keepUploadIds: z.array(z.number()),
})

export type GetProjectRecordsInput = z.infer<typeof GetProjectRecordsSchema>
type CreateProjectRecordInput = z.infer<typeof NewProjectRecordFormSchema>
type UpdateProjectRecordInput = z.infer<typeof ProjectRecordFormSchema>
type ProjectRecordInput = CreateProjectRecordInput | UpdateProjectRecordInput

function projectRecordInProjectWhere(projectSlug: string, id: number) {
  return { id, project: { slug: projectSlug } }
}

function normalizeDate(date: string | Date | null | undefined) {
  if (!date) return null
  return date instanceof Date ? date : new Date(date)
}

function projectRecordOverviewWhere(projectId: number, aiEnabled: boolean) {
  const where = {
    projectId,
    reviewState: ProjectRecordReviewState.APPROVED,
  }

  if (aiEnabled) return where

  return {
    ...where,
    projectRecordAuthorType: { not: ProjectRecordType.SYSTEM },
  }
}

async function validateProjectRecordRelations(projectSlug: string, input: ProjectRecordInput) {
  const topicIds = idsFromFormValue(input.projectRecordTopics)
  const uploadIds = idsFromFormValue(input.uploads)
  const subsubsectionIds = idsFromFormValue(input.subsubsections)
  const acquisitionAreaIds = idsFromFormValue(input.acquisitionAreas)

  await Promise.all([
    input.subsubsectionId
      ? db.subsubsection.findFirstOrThrow({
          where: { id: input.subsubsectionId, subsection: { project: { slug: projectSlug } } },
          select: { id: true },
        })
      : undefined,
    input.acquisitionAreaId
      ? db.acquisitionArea.findFirstOrThrow({
          where: {
            id: input.acquisitionAreaId,
            subsubsection: { subsection: { project: { slug: projectSlug } } },
          },
          select: { id: true },
        })
      : undefined,
    topicIds.length
      ? db.projectRecordTopic
          .findMany({
            where: { id: { in: topicIds }, project: { slug: projectSlug } },
            select: { id: true },
          })
          .then((records) => {
            if (records.length !== topicIds.length) throw new Error("Invalid project record topic")
          })
      : undefined,
    uploadIds.length
      ? db.upload
          .findMany({
            where: { id: { in: uploadIds }, project: { slug: projectSlug } },
            select: { id: true },
          })
          .then((records) => {
            if (records.length !== uploadIds.length) throw new Error("Invalid upload")
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
  ])
}

function createProjectRecordData(
  input: CreateProjectRecordInput,
  projectId: number,
  userId: number,
) {
  const { acquisitionAreas, projectRecordTopics, subsubsections, uploads, ...data } = input

  return {
    ...data,
    date: normalizeDate(data.date),
    projectId,
    projectRecordAuthorType: ProjectRecordType.USER,
    projectRecordUpdatedByType: ProjectRecordType.USER,
    reviewState: ProjectRecordReviewState.APPROVED,
    userId,
    updatedById: userId,
    acquisitionAreas: connectIds(idsFromFormValue(acquisitionAreas)),
    projectRecordTopics: connectIds(idsFromFormValue(projectRecordTopics)),
    subsubsections: connectIds(idsFromFormValue(subsubsections)),
    uploads: connectIds(idsFromFormValue(uploads)),
  }
}

function updateProjectRecordData(input: UpdateProjectRecordInput, userId: number) {
  const { acquisitionAreas, projectRecordTopics, subsubsections, uploads, ...data } = input

  return {
    ...data,
    date: normalizeDate(data.date),
    projectRecordUpdatedByType: ProjectRecordType.USER,
    updatedById: userId,
    acquisitionAreas: setIds(idsFromFormValue(acquisitionAreas)),
    projectRecordTopics: setIds(idsFromFormValue(projectRecordTopics)),
    subsubsections: setIds(idsFromFormValue(subsubsections)),
    uploads: setIds(idsFromFormValue(uploads)),
  }
}

export async function getAllProjectRecordsAdmin(headers: Headers) {
  await endpointAuth.admin(headers)

  const projectRecords = await db.projectRecord.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, slug: true } },
      projectRecordTopics: true,
      author: { select: { id: true, firstName: true, lastName: true } },
      updatedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  const stateOrder = {
    [ProjectRecordReviewState.NEEDSADMINREVIEW]: 0,
    [ProjectRecordReviewState.NEEDSREVIEW]: 1,
    [ProjectRecordReviewState.REJECTED]: 2,
    [ProjectRecordReviewState.APPROVED]: 3,
  }

  projectRecords.sort((a, b) => {
    if (stateOrder[a.reviewState] !== stateOrder[b.reviewState]) {
      return stateOrder[a.reviewState] - stateOrder[b.reviewState]
    }
    return a.createdAt < b.createdAt ? 1 : -1
  })

  return projectRecords
}

export async function getProjectRecordAdmin(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordAdminSchema>,
) {
  await endpointAuth.admin(headers)

  const projectRecord = await db.projectRecord.findFirst({
    where: { id: input.id },
    include: {
      project: {
        select: {
          id: true,
          slug: true,
          aiEnabled: true,
        },
      },
      projectRecordTopics: true,
      subsubsection: {
        include: {
          subsection: {
            select: { slug: true },
          },
        },
      },
      subsubsections: {
        select: {
          id: true,
          slug: true,
          subsection: { select: { slug: true } },
        },
      },
      acquisitionAreas: {
        select: {
          id: true,
          subsubsection: {
            select: {
              slug: true,
              subsection: { select: { slug: true } },
            },
          },
          parcel: { select: { alkisParcelId: true } },
        },
      },
      uploads: {
        orderBy: { id: "desc" },
        select: {
          title: true,
          id: true,
        },
      },
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      reviewedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      projectRecordEmail: {
        select: {
          id: true,
          textBody: true,
          from: true,
          date: true,
          subject: true,
          uploads: { select: { id: true, title: true } },
        },
      },
    },
  })

  if (!projectRecord) throw new NotFoundError()

  return projectRecord
}

export async function getProjectRecords(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordsSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const project = await db.project.findUnique({
    where: { slug: input.projectSlug },
    select: { id: true, aiEnabled: true },
  })

  if (!project) return []

  return db.projectRecord.findMany({
    include: projectRecordInclude,
    orderBy: { date: "desc" },
    where: projectRecordOverviewWhere(project.id, project.aiEnabled),
  })
}

export async function getProjectRecord(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  return db.projectRecord.findFirstOrThrow({
    include: projectRecordInclude,
    where: projectRecordInProjectWhere(input.projectSlug, input.id),
  })
}

export async function createProjectRecord(
  headers: Headers,
  input: z.infer<typeof CreateProjectRecordBySlugSchema>,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
  )
  const { projectSlug, ...data } = input
  await validateProjectRecordRelations(projectSlug, data)

  return db.projectRecord.create({
    data: createProjectRecordData(data, projectId, Number(session.userId)),
    include: projectRecordInclude,
  })
}

export async function updateProjectRecord(
  headers: Headers,
  input: z.infer<typeof UpdateProjectRecordBySlugSchema>,
) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug, ...data } = input
  await validateProjectRecordRelations(projectSlug, data)
  const previous = await db.projectRecord.findFirstOrThrow({
    where: projectRecordInProjectWhere(projectSlug, id),
    select: { id: true },
  })

  return db.projectRecord.update({
    where: { id: previous.id },
    data: updateProjectRecordData(data, Number(session.userId)),
    include: projectRecordInclude,
  })
}

export async function deleteProjectRecord(
  headers: Headers,
  input: z.infer<typeof DeleteProjectRecordBySlugSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)

  return db.projectRecord.deleteMany({
    where: projectRecordInProjectWhere(input.projectSlug, input.id),
  })
}

export async function getProjectRecordsNeedsReview(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordsSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)

  const rows = await db.projectRecord.findMany({
    where: {
      project: { slug: input.projectSlug },
      reviewState: ProjectRecordReviewState.NEEDSREVIEW,
    },
    orderBy: { date: "desc" },
    include: {
      projectRecordTopics: true,
      acquisitionArea: { select: { id: true } },
      _count: { select: { projectRecordComments: true, uploads: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return rows.map(({ _count, ...rest }) => ({
    ...rest,
    commentCount: _count.projectRecordComments,
    uploadCount: _count.uploads,
  }))
}

export async function getProjectRecordsTabCounts(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordsSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const project = await db.project.findUnique({
    where: { slug: input.projectSlug },
    select: { id: true, aiEnabled: true },
  })

  if (!project) {
    return { approvedCount: 0, needsReviewCount: 0, aiEnabled: false }
  }

  const approvedCount = await db.projectRecord.count({
    where: projectRecordOverviewWhere(project.id, project.aiEnabled),
  })

  const needsReviewCount = await db.projectRecord.count({
    where: {
      projectId: project.id,
      reviewState: ProjectRecordReviewState.NEEDSREVIEW,
    },
  })

  return { approvedCount, needsReviewCount, aiEnabled: project.aiEnabled }
}

export async function getProjectRecordDeleteInfo(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)

  const projectRecord = await db.projectRecord.findFirst({
    where: { id: input.id },
    include: {
      project: { select: { slug: true } },
      uploads: {
        include: {
          subsubsections: {
            select: {
              id: true,
              slug: true,
              subsection: { select: { slug: true } },
            },
          },
          acquisitionAreas: { select: { id: true } },
          projectRecords: { select: { id: true, title: true } },
          projectRecordEmail: {
            select: {
              id: true,
              projectRecords: { select: { id: true } },
            },
          },
        },
      },
    },
  })

  if (!projectRecord || projectRecord.project.slug !== input.projectSlug) {
    throw new NotFoundError()
  }

  const uploadsWithInfo = projectRecord.uploads.map((upload) => {
    const protectionReasons: {
      subsubsection?: number
      otherProjectRecords?: number[]
      projectRecordEmail?: number
    } = {}
    const displayData: {
      subsubsections?: Array<{ id: number; slug: string; subsectionSlug: string }>
      otherProjectRecords?: Array<{ id: number; title: string }>
    } = {}

    if (upload.subsubsections.length > 0) {
      protectionReasons.subsubsection = upload.subsubsections[0]!.id
      displayData.subsubsections = upload.subsubsections.map((subsub) => ({
        id: subsub.id,
        slug: subsub.slug,
        subsectionSlug: subsub.subsection.slug,
      }))
    }

    const otherProjectRecords = upload.projectRecords.filter((pr) => pr.id !== input.id)
    if (otherProjectRecords.length > 0) {
      protectionReasons.otherProjectRecords = otherProjectRecords.map((pr) => pr.id)
      displayData.otherProjectRecords = otherProjectRecords.map((pr) => ({
        id: pr.id,
        title: pr.title,
      }))
    }

    if (upload.projectRecordEmailId) {
      protectionReasons.projectRecordEmail = upload.projectRecordEmailId
    }

    let defaultAction: "save" | "delete" = "delete"

    if (
      upload.subsubsections.length > 0 ||
      upload.acquisitionAreas.length > 0 ||
      otherProjectRecords.length > 0
    ) {
      defaultAction = "save"
    } else if (upload.projectRecordEmailId) {
      const isEmailOnly =
        upload.subsubsections.length === 0 &&
        upload.acquisitionAreas.length === 0 &&
        otherProjectRecords.length === 0
      const emailProjectRecordIds =
        upload.projectRecordEmail?.projectRecords.map((pr) => pr.id) || []
      const isEmailOnlyLinkedToThisProjectRecord =
        emailProjectRecordIds.length === 1 && emailProjectRecordIds[0] === input.id

      defaultAction = isEmailOnly && isEmailOnlyLinkedToThisProjectRecord ? "delete" : "save"
    }

    return {
      id: upload.id,
      title: upload.title,
      defaultAction,
      protectionReasons,
      displayData,
    }
  })

  return {
    projectRecord: {
      id: projectRecord.id,
      title: projectRecord.title,
      reviewState: projectRecord.reviewState,
      project: { slug: projectRecord.project.slug },
    },
    uploads: uploadsWithInfo,
  }
}

export async function deleteProjectRecordWithUploadsDecision(
  headers: Headers,
  input: z.infer<typeof DeleteProjectRecordWithUploadsDecisionSchema>,
) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)

  const projectRecord = await db.projectRecord.findFirst({
    where: { id: input.id },
    include: {
      uploads: {
        select: {
          id: true,
          externalUrl: true,
          collaborationUrl: true,
          collaborationPath: true,
        },
      },
      projectRecordEmail: {
        include: {
          projectRecords: { select: { id: true } },
        },
      },
    },
  })

  if (!projectRecord) throw new NotFoundError()

  const candidateUploadIds = projectRecord.uploads.map((upload) => upload.id)
  const sanitizedKeepUploadIds = input.keepUploadIds.filter((uploadId) =>
    candidateUploadIds.includes(uploadId),
  )
  const toDeleteUploadIds = candidateUploadIds.filter(
    (uploadId) => !sanitizedKeepUploadIds.includes(uploadId),
  )
  const uploadsToDelete = projectRecord.uploads.filter((upload) =>
    toDeleteUploadIds.includes(upload.id),
  )

  for (const upload of uploadsToDelete) {
    await deleteUploadFileAndDbRecord(upload)
  }

  const projectRecordEmailId = projectRecord.projectRecordEmailId
  await db.projectRecord.deleteMany({ where: { id: input.id } })

  if (projectRecordEmailId) {
    const email = await db.projectRecordEmail.findFirst({
      where: { id: projectRecordEmailId },
      include: { projectRecords: { select: { id: true } } },
    })

    if (email && email.projectRecords.length === 0) {
      await db.projectRecordEmail.deleteMany({ where: { id: projectRecordEmailId } })
    }
  }

  await createLogEntry({
    action: "DELETE",
    message: `Protokoll-Eintrag ${input.id} ${uploadsToDelete.length > 0 ? ` und ${uploadsToDelete.length} verknüpfte Dokumente` : ""} gelöscht`,
    userId: Number(session.userId),
    projectSlug: input.projectSlug,
  })

  return {
    id: input.id,
    projectSlug: input.projectSlug,
    deletedUploadCount: uploadsToDelete.length,
  }
}

const projectRecordListInclude = {
  project: { select: { landAcquisitionModuleEnabled: true } },
  projectRecordTopics: true,
  subsubsection: {
    include: { subsection: { select: { slug: true } } },
  },
  acquisitionArea: {
    select: {
      id: true,
      subsubsection: {
        select: {
          slug: true,
          subsection: { select: { slug: true } },
        },
      },
      parcel: { select: { alkisParcelId: true } },
    },
  },
  uploads: { select: { id: true, title: true, createdAt: true } },
  _count: { select: { projectRecordComments: true, uploads: true } },
  author: { select: { id: true, firstName: true, lastName: true } },
  updatedBy: { select: { id: true, firstName: true, lastName: true } },
  reviewedBy: { select: { id: true, firstName: true, lastName: true } },
  assignedTo: { select: { id: true, firstName: true, lastName: true } },
} as const

function mapProjectRecordListRows(
  projectRecords: Array<
    Awaited<ReturnType<typeof db.projectRecord.findMany>>[number] & {
      _count: { projectRecordComments: number; uploads: number }
    }
  >,
) {
  return projectRecords.map(({ _count, ...rest }) => ({
    ...rest,
    commentCount: _count.projectRecordComments,
    uploadCount: _count.uploads,
  }))
}

export async function getProjectRecordsBySubsubsection(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordsBySubsubsectionSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const projectRecords = await db.projectRecord.findMany({
    where: {
      project: { slug: input.projectSlug },
      reviewState: { in: ["NEEDSREVIEW", "APPROVED"] },
      OR: [
        { subsubsectionId: input.subsubsectionId },
        { subsubsections: { some: { id: input.subsubsectionId } } },
      ],
    },
    orderBy: { date: "desc" },
    include: projectRecordListInclude,
  })

  return mapProjectRecordListRows(projectRecords)
}

export async function getProjectRecordsByAcquisitionArea(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordsByAcquisitionAreaSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const projectRecords = await db.projectRecord.findMany({
    where: {
      project: { slug: input.projectSlug },
      reviewState: { in: ["NEEDSREVIEW", "APPROVED"] },
      OR: [
        { acquisitionAreaId: input.acquisitionAreaId },
        { acquisitionAreas: { some: { id: input.acquisitionAreaId } } },
      ],
    },
    orderBy: { date: "desc" },
    include: projectRecordListInclude,
  })

  return mapProjectRecordListRows(projectRecords)
}
