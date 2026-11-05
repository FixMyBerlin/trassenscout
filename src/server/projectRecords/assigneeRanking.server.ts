import type { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import {
  formerMemberFk,
  loadUserRedactionContext,
} from "@/src/server/memberships/redactFormerProjectMemberUser.server"
import type { GetAssigneeRankingSchema } from "./projectRecords.inputSchemas"
import { projectRecordTaskWhere } from "./projectRecordVisibility.server"

export async function getAssigneeRanking(
  headers: Headers,
  input: z.infer<typeof GetAssigneeRankingSchema>,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )

  const subsections = await db.subsection.findMany({
    where: {
      projectId,
      subsubsections: {
        some: {
          OR: [
            { id: { in: input.subsubsectionIds } },
            { acquisitionAreas: { some: { id: { in: input.acquisitionAreaIds } } } },
          ],
        },
      },
    },
    select: { id: true, managerId: true },
  })

  const inSubsections = { subsectionId: { in: subsections.map(({ id }) => id) } }
  const assignments = await db.projectRecord.groupBy({
    by: ["assignedToId"],
    where: {
      ...projectRecordTaskWhere,
      projectId,
      // Without a PA, only the assignments across the project can rank people.
      ...(subsections.length > 0 && {
        OR: [
          { subsubsection: inSubsections },
          { subsubsections: { some: inSubsections } },
          { acquisitionArea: { subsubsection: inSubsections } },
          { acquisitionAreas: { some: { subsubsection: inSubsections } } },
        ],
      }),
    },
    _count: { _all: true },
  })

  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )

  const assignmentCounts: Record<string, number> = {}
  for (const { assignedToId, _count } of assignments) {
    const userId = formerMemberFk(assignedToId, redactionContext)
    if (userId != null) assignmentCounts[userId] = _count._all
  }

  return {
    leadIds: subsections.flatMap(
      ({ managerId }) => formerMemberFk(managerId, redactionContext) ?? [],
    ),
    assignmentCounts,
  }
}
