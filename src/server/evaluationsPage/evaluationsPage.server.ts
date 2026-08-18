import type { z } from "zod"
import type { Prisma } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import {
  emptyEvaluationsPageConfig,
  type EvaluationChartType,
  parseEvaluationsPageConfig,
} from "@/src/shared/evaluations/evaluationsPageConfig"
import { getEvaluationChartData } from "./evaluationChartData.server"
import type {
  EvaluationsPageByProjectSlugSchema,
  UpsertEvaluationsPageSchema,
} from "./evaluationsPage.inputSchemas"

function evaluationsPageInProjectWhere(projectSlug: string) {
  return { project: { slug: projectSlug } }
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

  const config = parseEvaluationsPageConfig(page.config)
  const charts = [...new Set(config.sections.map((section) => section.chart))].filter(
    (chart) => chart !== "",
  ) as EvaluationChartType[]

  return {
    title: page.title,
    config,
    chartData: await getEvaluationChartData(input.projectSlug, charts),
  }
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
    return {
      title: "",
      config: emptyEvaluationsPageConfig(),
      updatedAt: null,
      updatedById: null,
    }
  }

  return {
    title: page.title,
    config: parseEvaluationsPageConfig(page.config),
    updatedAt: page.updatedAt,
    updatedById: page.updatedById,
  }
}

export async function upsertEvaluationsPage(
  headers: Headers,
  input: z.infer<typeof UpsertEvaluationsPageSchema>,
) {
  const session = await endpointAuth.admin(headers)
  const { projectSlug, title, config } = input

  const project = await db.project.findUniqueOrThrow({
    where: { slug: projectSlug },
    select: { id: true },
  })

  return db.evaluationsPage.upsert({
    where: { projectId: project.id },
    create: {
      projectId: project.id,
      title,
      config: config as Prisma.InputJsonValue,
      updatedById: Number(session.userId),
    },
    update: {
      title,
      config: config as Prisma.InputJsonValue,
      updatedById: Number(session.userId),
    },
  })
}
