import type { z } from "zod"
import { MembershipRoleEnum, UserRoleEnum } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import { readableProjectWhere } from "@/src/server/authorization/readableProjectWhere.server"
import db from "@/src/server/db.server"
import {
  getUserRedactionContext,
  loadUserRedactionContexts,
} from "@/src/server/memberships/redactFormerProjectMemberUser.server"
import {
  countVisibleProjectRecordsBySubsubsection,
  mapSubsubsectionListRows,
  subsubsectionListRowInclude,
} from "@/src/server/subsubsections/subsubsections.server"
import { NotFoundError } from "@/src/shared/auth/errors"
import type {
  GetMyBookmarkedSubsubsectionsSchema,
  GetSubsubsectionBookmarkSchema,
  SetSubsubsectionBookmarkSchema,
} from "./subsubsectionBookmarks.inputSchemas"

/** Across all projects the user may read, newest activity first. */
export async function getMyBookmarkedSubsubsections(
  headers: Headers,
  input: z.infer<typeof GetMyBookmarkedSubsubsectionsSchema> = {},
) {
  const session = await endpointAuth.session(headers)
  const userId = Number(session.userId)
  const isAdmin = session.role === UserRoleEnum.ADMIN

  const subsubsections = await db.subsubsection.findMany({
    where: {
      bookmarks: { some: { userId } },
      subsection: {
        project: {
          ...readableProjectWhere(userId, session.role, input.projectSlug),
          bookmarksEnabled: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    ...(input.limit ? { take: input.limit } : {}),
    include: {
      ...subsubsectionListRowInclude,
      subsection: {
        select: {
          id: true,
          slug: true,
          project: {
            select: {
              id: true,
              slug: true,
              aiEnabled: true,
              memberships: { where: { userId }, select: { role: true } },
            },
          },
        },
      },
    },
  })

  const projects = new Map(
    subsubsections.map(({ subsection }) => [subsection.project.id, subsection.project]),
  )
  const projectIds = [...projects.keys()]
  const [redactionContexts, projectRecordCounts] = await Promise.all([
    loadUserRedactionContexts(projectIds, session.role, userId),
    countVisibleProjectRecordsBySubsubsection(
      subsubsections.map(({ id }) => id),
      [...projects.values()].map((project) => ({
        projectId: project.id,
        aiEnabled: project.aiEnabled,
        // Global admins may edit everywhere; members see what their own role allows.
        membershipRole: isAdmin
          ? null
          : (project.memberships[0]?.role ?? MembershipRoleEnum.VIEWER),
      })),
    ),
  ])

  const rows = mapSubsubsectionListRows(subsubsections, {
    redactionContextFor: (row) =>
      getUserRedactionContext(redactionContexts, row.subsection.project.id),
    projectRecordCounts,
  })

  return rows.map((row, index) => {
    const { id, slug, project } = subsubsections[index]!.subsection
    return { ...row, subsection: { id, slug }, project: { slug: project.slug } }
  })
}

function subsubsectionInProjectWhere(projectSlug: string, subsubsectionId: number) {
  return { id: subsubsectionId, subsection: { project: { slug: projectSlug } } }
}

export async function getSubsubsectionBookmark(
  headers: Headers,
  input: z.infer<typeof GetSubsubsectionBookmarkSchema>,
) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const bookmark = await db.subsubsectionBookmark.findFirst({
    where: {
      userId: Number(session.userId),
      subsubsection: subsubsectionInProjectWhere(input.projectSlug, input.subsubsectionId),
    },
    select: { id: true },
  })

  return { bookmarked: bookmark !== null }
}

/** Viewers may bookmark. Not logged. */
export async function setSubsubsectionBookmark(
  headers: Headers,
  input: z.infer<typeof SetSubsubsectionBookmarkSchema>,
) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const userId = Number(session.userId)

  const subsubsection = await db.subsubsection.findFirst({
    where: subsubsectionInProjectWhere(input.projectSlug, input.subsubsectionId),
    select: { id: true },
  })
  if (!subsubsection) throw new NotFoundError()

  if (input.bookmarked) {
    await db.subsubsectionBookmark.createMany({
      data: [{ userId, subsubsectionId: subsubsection.id }],
      skipDuplicates: true,
    })
  } else {
    await db.subsubsectionBookmark.deleteMany({
      where: { userId, subsubsectionId: subsubsection.id },
    })
  }

  return { bookmarked: input.bookmarked }
}
