import { UserRoleEnum } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"

export const FORMER_MEMBER_PLACEHOLDER = "Ehemalige:r Mitarbeiter:in"
export const FORMER_MEMBER_ADMIN_SUFFIX = " (kein Projektmitglied mehr)"
/** Generic label for current members in record/upload attribution (serializeProjectAuthor, non-admin viewers). */
export const ANONYMOUS_AUTHOR_PLACEHOLDER = "Projektmitglied"

type UserToRedact = {
  id: number
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  role?: string | null
}

export type ProjectUserDto =
  | { id: number; firstName: string | null; lastName: string | null; role?: string | null }
  | { firstName: string | null; lastName: string | null; role?: string | null }

type UserRelationKeys =
  | "author"
  | "updatedBy"
  | "reviewedBy"
  | "assignedTo"
  | "createdBy"
  | "manager"
  | "inviter"

export type WithSerializedUsers<T> = Omit<T, UserRelationKeys> & {
  [K in UserRelationKeys & keyof T]: ProjectUserDto | null
}

type SerializedProjectRecord<T> = WithSerializedUsers<T> &
  (T extends { projectRecordComments: Array<infer I> }
    ? { projectRecordComments: Array<RedactedComment<I>> }
    : {})

export type UserRedactionContext = {
  memberUserIds: Set<number>
  isAdmin: boolean
  sessionUserId: number
}

function getRedactionContext(contexts: Map<number, UserRedactionContext>, projectId: number) {
  const context = contexts.get(projectId)
  if (!context) {
    throw new Error(`Missing user redaction context for project ${projectId}`)
  }
  return context
}

export async function loadUserRedactionContexts(
  projectIds: number[],
  sessionRole: UserRoleEnum,
  sessionUserId: number,
) {
  const memberships =
    projectIds.length > 0
      ? await db.membership.findMany({
          where: { projectId: { in: projectIds } },
          select: { projectId: true, userId: true },
        })
      : []

  const memberUserIdsByProject = new Map<number, Set<number>>()
  for (const projectId of projectIds) {
    memberUserIdsByProject.set(projectId, new Set())
  }
  for (const membership of memberships) {
    memberUserIdsByProject.get(membership.projectId)?.add(membership.userId)
  }

  const isAdmin = sessionRole === UserRoleEnum.ADMIN
  const contexts = new Map<number, UserRedactionContext>()
  for (const projectId of projectIds) {
    contexts.set(projectId, {
      memberUserIds: memberUserIdsByProject.get(projectId) ?? new Set(),
      isAdmin,
      sessionUserId,
    })
  }
  return contexts
}

export async function loadUserRedactionContext(
  projectId: number,
  sessionRole: UserRoleEnum,
  sessionUserId: number,
) {
  const contexts = await loadUserRedactionContexts([projectId], sessionRole, sessionUserId)
  return getRedactionContext(contexts, projectId)
}

export function getUserRedactionContext(
  contexts: Map<number, UserRedactionContext>,
  projectId: number,
) {
  return getRedactionContext(contexts, projectId)
}

export function formerMemberFk(userId: number | null | undefined, context: UserRedactionContext) {
  if (userId == null) return userId ?? null
  if (userId === context.sessionUserId || context.memberUserIds.has(userId)) return userId
  return null
}

/** Attribution user ids: visible to global admins only (former members become null). */
export function redactAuthorUserId(
  userId: number | null | undefined,
  context: UserRedactionContext,
) {
  if (userId == null) return null
  if (!context.isAdmin) return null
  return formerMemberFk(userId, context)
}

function isFormerProjectMember(userId: number, context: UserRedactionContext) {
  return userId !== context.sessionUserId && !context.memberUserIds.has(userId)
}

export function serializeProjectUser(
  user: UserToRedact | null | undefined,
  context: UserRedactionContext,
): ProjectUserDto | null {
  if (!user) return null

  const { memberUserIds, isAdmin, sessionUserId } = context
  const role = "role" in user ? user.role : undefined
  const roleField = role !== undefined ? { role } : {}

  if (user.id === sessionUserId || memberUserIds.has(user.id)) {
    return {
      id: user.id,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      ...roleField,
    }
  }

  if (isAdmin) {
    const lastNameSuffix = user.lastName
      ? `${user.lastName}${FORMER_MEMBER_ADMIN_SUFFIX}`
      : FORMER_MEMBER_ADMIN_SUFFIX.trim()
    return {
      firstName: user.firstName ?? null,
      lastName: lastNameSuffix,
      ...roleField,
    }
  }

  return {
    firstName: FORMER_MEMBER_PLACEHOLDER,
    lastName: "",
    ...roleField,
  }
}

/** Attribution fields (author, createdBy, …): hidden from non-global-admins. */
export function serializeProjectAuthor(
  user: UserToRedact | null | undefined,
  context: UserRedactionContext,
): ProjectUserDto | null {
  if (!user) return null

  if (context.isAdmin) {
    return serializeProjectUser(user, context)
  }

  const role = "role" in user ? user.role : undefined
  const roleField = role !== undefined ? { role } : {}

  return {
    firstName: isFormerProjectMember(user.id, context)
      ? FORMER_MEMBER_PLACEHOLDER
      : ANONYMOUS_AUTHOR_PLACEHOLDER,
    lastName: "",
    ...roleField,
  }
}

export type RedactedComment<T> = WithSerializedUsers<T> & { isOwnComment: boolean }

/** Comments use serializeProjectUser so project viewers see member names; record attribution stays anonymous. */
export function redactCommentAuthor<
  T extends {
    author?: UserToRedact | null
    userId?: number | null
  },
>(comment: T, context: UserRedactionContext): RedactedComment<T> {
  const userId = "userId" in comment ? comment.userId : null
  return {
    ...comment,
    author: serializeProjectUser(comment.author, context),
    ...("userId" in comment ? { userId: formerMemberFk(userId, context) } : {}),
    isOwnComment: userId === context.sessionUserId,
  } as unknown as RedactedComment<T>
}

export function redactProjectRecordUsers<
  T extends {
    author?: UserToRedact | null
    updatedBy?: UserToRedact | null
    reviewedBy?: UserToRedact | null
    assignedTo?: UserToRedact | null
    userId?: number | null
    updatedById?: number | null
    reviewedById?: number | null
    assignedToId?: number | null
    projectRecordComments?: Array<{
      author?: UserToRedact | null
      userId?: number | null
    }>
  },
>(record: T, context: UserRedactionContext): SerializedProjectRecord<T> {
  const { projectRecordComments, ...rest } = record

  const serialized = {
    ...rest,
    author: serializeProjectAuthor(record.author, context),
    updatedBy: serializeProjectAuthor(record.updatedBy, context),
    reviewedBy: serializeProjectAuthor(record.reviewedBy, context),
    assignedTo: serializeProjectUser(record.assignedTo, context),
    ...("userId" in record ? { userId: redactAuthorUserId(record.userId, context) } : {}),
    ...("updatedById" in record
      ? { updatedById: redactAuthorUserId(record.updatedById, context) }
      : {}),
    ...("reviewedById" in record
      ? { reviewedById: redactAuthorUserId(record.reviewedById, context) }
      : {}),
    ...("assignedToId" in record
      ? { assignedToId: formerMemberFk(record.assignedToId, context) }
      : {}),
    ...(projectRecordComments
      ? {
          projectRecordComments: projectRecordComments.map((comment) =>
            redactCommentAuthor(comment, context),
          ),
        }
      : {}),
  }

  return serialized as unknown as SerializedProjectRecord<T>
}

export function redactUploadUsers<
  T extends {
    createdBy?: UserToRedact | null
    updatedBy?: UserToRedact | null
    createdById?: number | null
    updatedById?: number | null
  },
>(upload: T, context: UserRedactionContext): WithSerializedUsers<T> {
  return {
    ...upload,
    createdBy: serializeProjectAuthor(upload.createdBy, context),
    updatedBy: serializeProjectAuthor(upload.updatedBy, context),
    createdById: redactAuthorUserId(upload.createdById, context),
    updatedById: redactAuthorUserId(upload.updatedById, context),
  } as unknown as WithSerializedUsers<T>
}
