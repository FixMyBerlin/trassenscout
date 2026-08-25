import { z } from "zod"
import { projectRecordAssignedNotificationToUser } from "@/emails/mailers/projectRecordAssignedNotificationToUser"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ProjectRecordReviewState, ProjectRecordType } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { deleteUploadFileAndDbRecord } from "@/src/server/uploads/_utils/deleteUploadFileAndDbRecord"
import { AuthorizationError, NotFoundError } from "@/src/shared/auth/errors"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { connectIds, idsFromFormValue, setIds } from "@/src/shared/prisma/connectIds"
import {
  DeleteProjectRecordSchema,
  NewProjectRecordFormSchema,
  PatchProjectRecordAssignmentSchema,
  ProjectRecordFormSchema,
} from "@/src/shared/projectRecords/schemas"
import { projectRecordInclude } from "./projectRecordInclude"
import { GetProjectRecordAdminSchema } from "./projectRecords.inputSchemas"
import {
  projectRecordDetailVisibilityWhere,
  projectRecordOverviewVisibilityWhere,
} from "./projectRecordVisibility.server"

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
  return {
    projectId,
    ...projectRecordOverviewVisibilityWhere(aiEnabled),
  }
}

/**
 * Which forms a record offers is admin-only, so the server has to hold that line against a
 * hand-crafted payload. Only an authorization failure means "not an admin" — anything else
 * must propagate, or an admin's change would vanish from an otherwise successful save.
 */
async function isAdminRequest(headers: Headers) {
  try {
    await endpointAuth.admin(headers)
    return true
  } catch (error) {
    if (error instanceof AuthorizationError) return false
    throw error
  }
}

async function validateProjectRecordRelations(
  projectSlug: string,
  input: ProjectRecordInput,
  /** Whether this request writes `projectRecordTemplateId`; see the call below. */
  validatesOriginTemplate: boolean,
) {
  const tagIds = idsFromFormValue(input.tags)
  const uploadIds = idsFromFormValue(input.uploads)
  const subsubsectionIds = idsFromFormValue(input.subsubsections)
  const acquisitionAreaIds = idsFromFormValue(input.acquisitionAreas)
  const formTemplateIds = idsFromFormValue(input.formTemplates)

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
    formTemplateIds.length
      ? db.formTemplate
          .findMany({
            where: { id: { in: formTemplateIds }, projects: { some: { slug: projectSlug } } },
            select: { id: true },
          })
          .then((records) => {
            if (records.length !== formTemplateIds.length) throw new Error("Invalid form template")
          })
      : undefined,
    // Skipped on a non-admin update: the value is dropped from the write anyway, and checking
    // a link the request is not changing would make such a record unsaveable.
    validatesOriginTemplate && input.projectRecordTemplateId
      ? db.projectRecordTemplate.findFirstOrThrow({
          where: {
            id: input.projectRecordTemplateId,
            projects: { some: { slug: projectSlug } },
          },
          select: { id: true },
        })
      : undefined,
  ])
}

function createProjectRecordData(
  input: CreateProjectRecordInput,
  projectId: number,
  userId: number,
  allowFormTemplates: boolean,
) {
  const { acquisitionAreas, tags, subsubsections, uploads, formTemplates, ...data } = input

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
    tags: connectIds(idsFromFormValue(tags)),
    subsubsections: connectIds(idsFromFormValue(subsubsections)),
    uploads: connectIds(idsFromFormValue(uploads)),
    // Omitted for a non-admin so Prisma leaves the relation alone. `projectRecordTemplateId`
    // is not gated on create: it records the template the author picked.
    ...(allowFormTemplates ? { formTemplates: connectIds(idsFromFormValue(formTemplates)) } : {}),
  }
}

function updateProjectRecordData(
  input: UpdateProjectRecordInput,
  userId: number,
  allowAdminFields: boolean,
) {
  const {
    acquisitionAreas,
    tags,
    subsubsections,
    uploads,
    formTemplates,
    projectRecordTemplateId,
    ...data
  } = input

  return {
    ...data,
    date: normalizeDate(data.date),
    projectRecordUpdatedByType: ProjectRecordType.USER,
    updatedById: userId,
    acquisitionAreas: setIds(idsFromFormValue(acquisitionAreas)),
    tags: setIds(idsFromFormValue(tags)),
    subsubsections: setIds(idsFromFormValue(subsubsections)),
    uploads: setIds(idsFromFormValue(uploads)),
    // The origin template belongs here too: repointing it also changes the forms offered.
    ...(allowAdminFields
      ? { projectRecordTemplateId, formTemplates: setIds(idsFromFormValue(formTemplates)) }
      : {}),
  }
}

function projectRecordDetailPath(projectSlug: string, recordId: number) {
  return `/${projectSlug}/project-records/${recordId}`
}

async function sendProjectRecordAssignmentNotification({
  assigneeId,
  actorUserId,
  recordTitle,
  projectSlug,
  recordId,
}: {
  assigneeId: number
  actorUserId: number
  recordTitle: string
  projectSlug: string
  recordId: number
}) {
  const [assignee, actor] = await Promise.all([
    db.user.findUnique({
      where: { id: assigneeId },
      select: { email: true, firstName: true, lastName: true },
    }),
    db.user.findUnique({
      where: { id: actorUserId },
      select: { firstName: true, lastName: true },
    }),
  ])

  if (!assignee || !actor) return

  const assigneeName =
    [assignee.firstName, assignee.lastName].filter(Boolean).join(" ") || assignee.email
  const actorName = [actor.firstName, actor.lastName].filter(Boolean).join(" ") || "Unbekannt"

  await (
    await projectRecordAssignedNotificationToUser({
      assigneeEmail: assignee.email,
      assigneeName,
      actorName,
      recordTitle,
      projectName: shortTitle(projectSlug),
      recordPath: projectRecordDetailPath(projectSlug, recordId),
    })
  ).send()
}

export async function getAllProjectRecordsAdmin(headers: Headers) {
  await endpointAuth.admin(headers)

  return db.projectRecord.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, slug: true } },
      tags: true,
      author: { select: { id: true, firstName: true, lastName: true } },
      updatedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  })
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
      tags: true,
      // Every `m2mFields` entry must be here: the edit form resubmits what this returns, so a
      // missing relation arrives back as [] and the save wipes it.
      formTemplates: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          projects: { select: { slug: true } },
        },
        orderBy: { title: "asc" },
      },
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
  const { projectId, membershipRole } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )

  const canEdit = membershipRole === null || editorRoles.includes(membershipRole)

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { aiEnabled: true },
  })

  if (!project) {
    throw new NotFoundError()
  }

  const aiEnabled = project.aiEnabled ?? false

  return db.projectRecord.findFirstOrThrow({
    include: projectRecordInclude,
    where: {
      id: input.id,
      projectId,
      ...projectRecordDetailVisibilityWhere(aiEnabled, canEdit),
    },
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
  const allowFormTemplates = await isAdminRequest(headers)
  await validateProjectRecordRelations(projectSlug, data, true)
  const userId = Number(session.userId)

  const record = await db.projectRecord.create({
    data: createProjectRecordData(data, projectId, userId, allowFormTemplates),
    include: projectRecordInclude,
  })

  if (record.assignedToId !== null) {
    await sendProjectRecordAssignmentNotification({
      assigneeId: record.assignedToId,
      actorUserId: userId,
      recordTitle: record.title,
      projectSlug,
      recordId: record.id,
    })
  }

  return record
}

export async function updateProjectRecord(
  headers: Headers,
  input: z.infer<typeof UpdateProjectRecordBySlugSchema>,
) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug, ...data } = input
  const allowAdminFields = await isAdminRequest(headers)
  await validateProjectRecordRelations(projectSlug, data, allowAdminFields)
  const userId = Number(session.userId)
  const previous = await db.projectRecord.findFirstOrThrow({
    where: projectRecordInProjectWhere(projectSlug, id),
    select: { id: true, assignedToId: true },
  })

  const record = await db.projectRecord.update({
    where: { id: previous.id },
    data: updateProjectRecordData(data, userId, allowAdminFields),
    include: projectRecordInclude,
  })

  const newAssigneeId = record.assignedToId
  const previousAssigneeId = previous.assignedToId ?? null
  const isNewAssignment = newAssigneeId !== null && newAssigneeId !== previousAssigneeId

  if (isNewAssignment) {
    await sendProjectRecordAssignmentNotification({
      assigneeId: newAssigneeId,
      actorUserId: userId,
      recordTitle: record.title,
      projectSlug,
      recordId: record.id,
    })
  }

  return record
}

export async function patchProjectRecordAssignment(
  headers: Headers,
  input: z.infer<typeof PatchProjectRecordAssignmentSchema>,
) {
  const { projectId, membershipRole, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const { id, projectSlug, assignedToId, editingState } = input
  const userId = Number(session.userId)
  const canEdit = membershipRole === null || editorRoles.includes(membershipRole)

  if (assignedToId != null) {
    const assigneeMembership = await db.membership.findFirst({
      where: { userId: assignedToId, project: { slug: projectSlug } },
      select: { id: true },
    })
    if (!assigneeMembership) {
      throw new AuthorizationError()
    }
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { aiEnabled: true },
  })

  if (!project) {
    throw new NotFoundError()
  }

  const aiEnabled = project.aiEnabled ?? false

  const previous = await db.projectRecord.findFirstOrThrow({
    where: {
      id,
      projectId,
      ...projectRecordDetailVisibilityWhere(aiEnabled, canEdit),
    },
  })

  const record = await db.projectRecord.update({
    where: { id: previous.id },
    data: {
      assignedToId,
      editingState,
      updatedById: userId,
      projectRecordUpdatedByType: ProjectRecordType.USER,
    },
    include: projectRecordInclude,
  })

  const previousAssigneeId = previous.assignedToId ?? null
  const newAssigneeId = record.assignedToId
  const isNewAssignment = newAssigneeId !== null && newAssigneeId !== previousAssigneeId

  if (isNewAssignment) {
    await sendProjectRecordAssignmentNotification({
      assigneeId: newAssigneeId,
      actorUserId: userId,
      recordTitle: record.title,
      projectSlug,
      recordId: record.id,
    })
  }

  await createLogEntry({
    action: "UPDATE",
    message: "Protokoll-Eintrag Zuweisung oder Status geändert",
    userId,
    projectSlug,
    projectRecordId: record.id,
    previousRecord: previous,
    updatedRecord: record,
  })

  return record
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
      tags: true,
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
    where: projectRecordInProjectWhere(input.projectSlug, input.id),
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
  tags: true,
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
