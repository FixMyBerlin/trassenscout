import { z } from "zod"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { shortTitle } from "@/src/components/core/components/text/titles"
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
  subsubsectionExtraFieldDefinitions: true,
  operators: {
    select: {
      id: true,
      slug: true,
    },
  },
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
  const previous = await db.project.findFirstOrThrow({
    where: { slug: projectSlug },
    select: {
      id: true,
      slug: true,
      subTitle: true,
      description: true,
      logoSrc: true,
      partnerLogoSrcs: true,
      exportEnabled: true,
      aiEnabled: true,
      alkisStateKey: true,
      landAcquisitionModuleEnabled: true,
    },
  })

  const project = await db.project.update({
    where: { slug: projectSlug },
    data: { ...data, partnerLogoSrcs: partnerLogoSrcs || undefined },
  })

  await createLogEntry({
    action: "UPDATE",
    message: `Projekt ${frenchQuote(shortTitle(project.slug))} wurde bearbeitet.`,
    userId: Number(session.userId),
    projectId: project.id,
    previousRecord: {
      id: previous.id,
      slug: previous.slug,
      subTitle: previous.subTitle,
      description: previous.description,
      logoSrc: previous.logoSrc,
      partnerLogoSrcs: previous.partnerLogoSrcs,
      exportEnabled: previous.exportEnabled,
      aiEnabled: previous.aiEnabled,
      alkisStateKey: previous.alkisStateKey,
      landAcquisitionModuleEnabled: previous.landAcquisitionModuleEnabled,
    },
    updatedRecord: {
      id: project.id,
      slug: project.slug,
      subTitle: project.subTitle,
      description: project.description,
      logoSrc: project.logoSrc,
      partnerLogoSrcs: project.partnerLogoSrcs,
      exportEnabled: project.exportEnabled,
      aiEnabled: project.aiEnabled,
      alkisStateKey: project.alkisStateKey,
      landAcquisitionModuleEnabled: project.landAcquisitionModuleEnabled,
    },
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
  const adminSession = await endpointAuth.admin(headers)
  const { partnerLogoSrcs, ...data } = input

  const project = await db.project.create({
    data: { ...data, partnerLogoSrcs: partnerLogoSrcs || undefined },
  })

  await createLogEntry({
    action: "CREATE",
    message: `Neues Projekt ${frenchQuote(shortTitle(project.slug))} wurde erstellt.`,
    userId: Number(adminSession.userId),
    projectId: project.id,
    updatedRecord: {
      id: project.id,
      slug: project.slug,
      subTitle: project.subTitle,
      description: project.description,
      logoSrc: project.logoSrc,
      partnerLogoSrcs: project.partnerLogoSrcs,
      exportEnabled: project.exportEnabled,
      aiEnabled: project.aiEnabled,
      alkisStateKey: project.alkisStateKey,
      landAcquisitionModuleEnabled: project.landAcquisitionModuleEnabled,
    },
  })

  return project
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
