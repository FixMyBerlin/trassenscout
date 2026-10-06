import type { z } from "zod"
import { ProjectRecordEditingState, UserRoleEnum } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import type { GetMyAssignedRecordsSchema } from "./projectRecords.inputSchemas"

function directionWhere(
  direction: z.infer<typeof GetMyAssignedRecordsSchema>["direction"],
  userId: number,
) {
  if (direction === "byMe") return { assignedById: userId }
  if (direction === "toMe") return { assignedToId: userId }
  // Authorship survives a reassignment, assignedById does not: it moves to whoever reassigned last.
  if (direction === "createdByMe") return { userId }
  return {}
}

function readableProjectWhere(userId: number, role: string, projectSlug: string | undefined) {
  return {
    ...(projectSlug ? { slug: projectSlug } : {}),
    ...(role === UserRoleEnum.ADMIN ? {} : { memberships: { some: { userId } } }),
  }
}

export async function countMyAssignedRecords(headers: Headers, projectSlug?: string) {
  const session = await endpointAuth.session(headers)
  const userId = Number(session.userId)

  return db.projectRecord.count({
    where: {
      assignedToId: userId,
      editingState: ProjectRecordEditingState.PENDING,
      project: readableProjectWhere(userId, session.role, projectSlug),
    },
  })
}

export async function getMyAssignedRecords(
  headers: Headers,
  input: z.infer<typeof GetMyAssignedRecordsSchema>,
) {
  const session = await endpointAuth.session(headers)
  const userId = Number(session.userId)

  const records = await db.projectRecord.findMany({
    where: {
      // A task is a record with an assignee, whichever direction is picked.
      assignedToId: { not: null },
      ...directionWhere(input.direction, userId),
      ...(input.editingState ? { editingState: input.editingState } : {}),
      project: readableProjectWhere(userId, session.role, input.projectSlug),
    },
    orderBy: [{ assignedAt: { sort: "desc", nulls: "last" } }, { date: "desc" }],
    select: {
      id: true,
      title: true,
      date: true,
      editingState: true,
      assignedAt: true,
      project: { select: { slug: true } },
      tags: { select: { id: true, title: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, institution: true } },
      _count: { select: { uploads: true, projectRecordComments: true } },
    },
  })

  return records
}
