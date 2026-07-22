import { z } from "zod"
import { longTitle } from "@/src/components/core/components/text/titles"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { authorizeProjectMemberByProjectSlug } from "@/src/server/authorization/authorizeProjectMember.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { membershipUpdateSession } from "@/src/server/memberships/membershipUpdateSession"
import { UpdateProjectSchema } from "@/src/shared/projects/schemas"
import {
  CreateProjectSchema,
  GetProjectBySlugSchema,
  UpdateProjectsFeatureFlagSchema,
} from "./projects.inputSchemas"
import { getEditableProjectsForInvite } from "./queries/getEditableProjectsForInvite.server"

const projectSelect = {
  id: true,
  aiEnabled: true,
  alkisStateKey: true,
  description: true,
  evaluationsEnabled: true,
  exportEnabled: true,
  landAcquisitionModuleEnabled: true,
  logoSrc: true,
  partnerLogoSrcs: true,
  showLogEntries: true,
  slug: true,
  subTitle: true,
} as const

export async function getProjectsForCurrentUser(headers: Headers) {
  const session = await endpointAuth.session(headers)

  if (session.role === UserRoleEnum.ADMIN) {
    return db.project.findMany({
      orderBy: { slug: "asc" },
      select: projectSelect,
    })
  }

  return db.project.findMany({
    orderBy: { slug: "asc" },
    select: projectSelect,
    where: {
      memberships: {
        some: { userId: Number(session.userId) },
      },
    },
  })
}

export async function getProjectsForInvite(headers: Headers) {
  const session = await endpointAuth.session(headers)
  return getEditableProjectsForInvite(session)
}

export async function getProjectBySlug(
  headers: Headers,
  input: z.infer<typeof GetProjectBySlugSchema>,
) {
  const session = await endpointAuth.session(headers)

  return db.project.findFirstOrThrow({
    select: projectSelect,
    where: {
      slug: input.projectSlug,
      ...(session.role === UserRoleEnum.ADMIN
        ? {}
        : { memberships: { some: { userId: Number(session.userId) } } }),
    },
  })
}

export async function updateProject(headers: Headers, input: z.infer<typeof UpdateProjectSchema>) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, editorRoles)

  const { projectSlug, partnerLogoSrcs, ...data } = input
  const previous = await db.project.findFirst({ where: { slug: projectSlug } })

  const project = await db.project.update({
    where: { slug: projectSlug },
    data: { ...data, partnerLogoSrcs: partnerLogoSrcs || undefined },
  })

  await createLogEntry({
    action: "UPDATE",
    message: `Projekt ${longTitle(project.slug)} bearbeitet`,
    userId: Number(session.userId),
    projectId: project.id,
    previousRecord: previous,
    updatedRecord: project,
  })

  if (previous?.slug && previous.slug !== project.slug) {
    await membershipUpdateSession(Number(session.userId))
  }

  return project
}

export async function getProjectsAdmin(headers: Headers) {
  await endpointAuth.admin(headers)

  const projects = await db.project.findMany({
    orderBy: { slug: "asc" },
    take: 100,
  })

  return { projects }
}

export async function getAdminProjectsWithCounts(headers: Headers) {
  await endpointAuth.admin(headers)

  const projects = await db.project.findMany({
    orderBy: { id: "asc" },
    take: 100,
  })

  const projectsWithCounts = await Promise.all(
    projects
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .map(async (project) => {
        const [subsectionCount, subsubsectionCount] = await Promise.all([
          db.subsection.count({ where: { projectId: project.id } }),
          db.subsubsection.count({
            where: { subsection: { projectId: project.id } },
          }),
        ])

        return {
          ...project,
          subsectionCount,
          subsubsectionCount,
        }
      }),
  )

  return { projects: projectsWithCounts }
}

export async function createProject(headers: Headers, input: z.infer<typeof CreateProjectSchema>) {
  await endpointAuth.admin(headers)
  const { partnerLogoSrcs, ...data } = input

  return db.project.create({
    data: { ...data, partnerLogoSrcs: partnerLogoSrcs || undefined },
  })
}

export async function updateProjectsFeatureFlag(
  headers: Headers,
  input: z.infer<typeof UpdateProjectsFeatureFlagSchema>,
) {
  await endpointAuth.admin(headers)
  const { projectSlugs, key, enabled } = input

  return db.project.updateMany({
    where: { slug: { in: projectSlugs } },
    data: { [key]: enabled },
  })
}
