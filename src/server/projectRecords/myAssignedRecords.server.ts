import type { z } from "zod"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import type { GetMyAssignedRecordsSchema } from "./projectRecords.inputSchemas"

function myAssignmentsWhere(userId: number) {
  return { OR: [{ assignedToId: userId }, { assignedById: userId }] }
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
      ...myAssignmentsWhere(userId),
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

  const direction =
    input.direction === "byMe"
      ? { assignedById: userId }
      : input.direction === "toMe"
        ? { assignedToId: userId }
        : myAssignmentsWhere(userId)

  const records = await db.projectRecord.findMany({
    where: {
      ...direction,
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
