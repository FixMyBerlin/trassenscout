import type { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import type {
  EvaluationsPageByProjectSlugSchema,
  UpsertEvaluationsPageSchema,
} from "./evaluationsPage.inputSchemas"

function evaluationsPageInProjectWhere(projectSlug: string) {
  return { project: { slug: projectSlug } }
}

export async function getEvaluationsPages(headers: Headers) {
  await endpointAuth.admin(headers)

  const projects = await db.project.findMany({
    select: {
      slug: true,
      subTitle: true,
      evaluationsEnabled: true,
      evaluationsPage: { select: { title: true, updatedAt: true, updatedById: true } },
    },
    orderBy: { slug: "asc" },
  })

  return projects.map((project) => ({
    projectSlug: project.slug,
    projectSubTitle: project.subTitle,
    evaluationsEnabled: project.evaluationsEnabled,
    title: project.evaluationsPage?.title ?? null,
    updatedAt: project.evaluationsPage?.updatedAt ?? null,
    updatedById: project.evaluationsPage?.updatedById ?? null,
  }))
}

export async function getEvaluationsPage(
  headers: Headers,
  input: z.infer<typeof EvaluationsPageByProjectSlugSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const page = await db.evaluationsPage.findFirst({
    where: evaluationsPageInProjectWhere(input.projectSlug),
  })

  if (!page) return null

  return { title: page.title, markdown: page.markdown }
}

export async function getEvaluationsPageAdmin(
  headers: Headers,
  input: z.infer<typeof EvaluationsPageByProjectSlugSchema>,
) {
  await endpointAuth.admin(headers)

  const page = await db.evaluationsPage.findFirst({
    where: evaluationsPageInProjectWhere(input.projectSlug),
  })

  if (!page) {
    return { title: "", markdown: "", updatedAt: null, updatedById: null }
  }

  return {
    title: page.title,
    markdown: page.markdown,
    updatedAt: page.updatedAt,
    updatedById: page.updatedById,
  }
}

export async function upsertEvaluationsPage(
  headers: Headers,
  input: z.infer<typeof UpsertEvaluationsPageSchema>,
) {
  const session = await endpointAuth.admin(headers)
  const { projectSlug, title, markdown } = input

  const project = await db.project.findUniqueOrThrow({
    where: { slug: projectSlug },
    select: { id: true },
  })

  return db.evaluationsPage.upsert({
    where: { projectId: project.id },
    create: {
      projectId: project.id,
      title,
      markdown,
      updatedById: Number(session.userId),
    },
    update: {
      title,
      markdown,
      updatedById: Number(session.userId),
    },
  })
}
