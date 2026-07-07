import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import {
  CreateProjectRecordTemplateSchema,
  DeleteProjectRecordTemplateSchema,
  ProjectRecordTemplateByIdSchema,
  ProjectRecordTemplateFormSchema,
  ProjectRecordTemplatesByProjectSchema,
  UpdateProjectRecordTemplateSchema,
} from "@/src/shared/projectRecordTemplates/schemas"
import { validateTemplateTagScope } from "./_utils/validateTemplateTagScope"

export type ProjectRecordTemplatesByProjectInput = z.infer<
  typeof ProjectRecordTemplatesByProjectSchema
>

const projectRecordTemplateInclude = {
  projects: { select: { id: true, slug: true, subTitle: true } },
  tags: true,
} as const

function templateData(
  input: z.infer<typeof ProjectRecordTemplateFormSchema>,
  setRelations = false,
) {
  const { projectIds, tagIds, ...data } = input
  const relationVerb = setRelations ? "set" : "connect"

  return {
    ...data,
    projects: { [relationVerb]: projectIds.map((id) => ({ id })) },
    tags: { [relationVerb]: tagIds.map((id) => ({ id })) },
  }
}

export async function getProjectRecordTemplates(headers: Headers) {
  await endpointAuth.admin(headers)

  return db.projectRecordTemplate.findMany({
    include: projectRecordTemplateInclude,
    orderBy: { templateTitle: "asc" },
  })
}

export async function getProjectRecordTemplatesByProject(
  headers: Headers,
  input: z.infer<typeof ProjectRecordTemplatesByProjectSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  return db.projectRecordTemplate.findMany({
    include: projectRecordTemplateInclude,
    orderBy: { templateTitle: "asc" },
    where: { projects: { some: { slug: input.projectSlug } } },
  })
}

export async function getProjectRecordTemplate(
  headers: Headers,
  input: z.infer<typeof ProjectRecordTemplateByIdSchema>,
) {
  await endpointAuth.admin(headers)

  return db.projectRecordTemplate.findUniqueOrThrow({
    include: projectRecordTemplateInclude,
    where: { id: input.id },
  })
}

export async function createProjectRecordTemplate(
  headers: Headers,
  input: z.infer<typeof CreateProjectRecordTemplateSchema>,
) {
  await endpointAuth.admin(headers)
  await validateTemplateTagScope(input)

  return db.projectRecordTemplate.create({
    data: templateData(input),
    include: projectRecordTemplateInclude,
  })
}

export async function updateProjectRecordTemplate(
  headers: Headers,
  input: z.infer<typeof UpdateProjectRecordTemplateSchema>,
) {
  await endpointAuth.admin(headers)
  const { id, ...data } = input
  await validateTemplateTagScope(data)

  return db.projectRecordTemplate.update({
    where: { id },
    data: templateData(data, true),
    include: projectRecordTemplateInclude,
  })
}

export async function deleteProjectRecordTemplate(
  headers: Headers,
  input: z.infer<typeof DeleteProjectRecordTemplateSchema>,
) {
  await endpointAuth.admin(headers)

  return db.projectRecordTemplate.delete({
    where: { id: input.id },
    include: projectRecordTemplateInclude,
  })
}

export async function getTagsAdmin(headers: Headers) {
  await endpointAuth.admin(headers)

  const tags = await db.tag.findMany({
    select: {
      id: true,
      title: true,
      projectId: true,
      project: {
        select: {
          slug: true,
        },
      },
    },
    orderBy: [{ projectId: "asc" }, { title: "asc" }],
  })

  return { tags }
}
