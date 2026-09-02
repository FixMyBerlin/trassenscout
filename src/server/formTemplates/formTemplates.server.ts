import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { sanitizeFieldsForSave } from "@/src/shared/formTemplates/fieldSchemas"
import {
  CreateFormTemplateSchema,
  DeleteFormTemplateSchema,
  FormTemplateByIdSchema,
  FormTemplateFormSchema,
  FormTemplatesByProjectSchema,
  UpdateFormTemplateSchema,
} from "@/src/shared/formTemplates/schemas"

export type FormTemplatesByProjectInput = z.infer<typeof FormTemplatesByProjectSchema>

const formTemplateInclude = {
  projects: { select: { id: true, slug: true, subTitle: true } },
} as const

function templateData(
  input: z.infer<typeof FormTemplateFormSchema>,
  updatedById: number,
  setRelations = false,
) {
  const { projectIds, fields, bodyMarkdown, ...data } = input
  const relationVerb = setRelations ? "set" : "connect"

  return {
    ...data,
    bodyMarkdown,
    // Otherwise metadata for removed placeholders piles up invisibly.
    fields: sanitizeFieldsForSave(bodyMarkdown, fields),
    projects: { [relationVerb]: projectIds.map((id) => ({ id })) },
    updatedById,
  }
}

export async function getFormTemplates(headers: Headers) {
  await endpointAuth.admin(headers)

  return db.formTemplate.findMany({
    include: formTemplateInclude,
    orderBy: { title: "asc" },
  })
}

export async function getFormTemplate(
  headers: Headers,
  input: z.infer<typeof FormTemplateByIdSchema>,
) {
  await endpointAuth.admin(headers)

  return db.formTemplate.findUniqueOrThrow({
    include: formTemplateInclude,
    where: { id: input.id },
  })
}

/** Readable by viewers: they may fill forms in. */
export async function getFormTemplatesByProject(
  headers: Headers,
  input: z.infer<typeof FormTemplatesByProjectSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  return db.formTemplate.findMany({
    include: formTemplateInclude,
    orderBy: { title: "asc" },
    where: { projects: { some: { slug: input.projectSlug } } },
  })
}

export async function createFormTemplate(
  headers: Headers,
  input: z.infer<typeof CreateFormTemplateSchema>,
) {
  const { userId } = await endpointAuth.admin(headers)

  return db.formTemplate.create({
    data: templateData(input, Number(userId)),
    include: formTemplateInclude,
  })
}

/** Without this, records in a removed project keep offering a form the modal cannot load. */
async function pruneLinksOutsideProjects(formTemplateId: number, projectIds: number[]) {
  const linkedTo = { formTemplates: { some: { id: formTemplateId } } }
  const outsideProjects = projectIds.length ? { projectId: { notIn: projectIds } } : {} // No projects left: every link is out of scope.
  const templatesOutsideProjects = projectIds.length
    ? { NOT: { projects: { some: { id: { in: projectIds } } } } }
    : {}

  const [projectRecords, projectRecordTemplates] = await Promise.all([
    db.projectRecord.findMany({ where: { ...linkedTo, ...outsideProjects }, select: { id: true } }),
    db.projectRecordTemplate.findMany({
      where: { ...linkedTo, ...templatesOutsideProjects },
      select: { id: true },
    }),
  ])

  if (!projectRecords.length && !projectRecordTemplates.length) return

  await db.formTemplate.update({
    where: { id: formTemplateId },
    data: {
      projectRecords: { disconnect: projectRecords.map(({ id }) => ({ id })) },
      projectRecordTemplates: { disconnect: projectRecordTemplates.map(({ id }) => ({ id })) },
    },
  })
}

export async function updateFormTemplate(
  headers: Headers,
  input: z.infer<typeof UpdateFormTemplateSchema>,
) {
  const { userId } = await endpointAuth.admin(headers)
  const { id, ...data } = input

  await db.formTemplate.update({
    where: { id },
    data: templateData(data, Number(userId), true),
  })
  await pruneLinksOutsideProjects(id, data.projectIds)

  return db.formTemplate.findUniqueOrThrow({ where: { id }, include: formTemplateInclude })
}

export async function deleteFormTemplate(
  headers: Headers,
  input: z.infer<typeof DeleteFormTemplateSchema>,
) {
  await endpointAuth.admin(headers)

  return db.formTemplate.delete({
    where: { id: input.id },
    include: formTemplateInclude,
  })
}
