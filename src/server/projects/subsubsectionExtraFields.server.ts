import { z } from "zod"
import type { Prisma } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import {
  getRemovedDefinitionNames,
  parseDefinitions,
  parseExtraFields,
  SubsubsectionExtraFieldDefinitionsSchema,
} from "@/src/shared/subsubsections/extraFieldSchemas"

export const GetSubsubsectionExtraFieldValueCountsSchema = ProjectSlugRequiredSchema.extend({
  fieldNames: z.array(z.string()).min(1),
})

export const UpdateProjectSubsubsectionExtraFieldDefinitionsSchema =
  ProjectSlugRequiredSchema.extend({
    definitions: SubsubsectionExtraFieldDefinitionsSchema,
  })

export async function getSubsubsectionExtraFieldsProjects(headers: Headers) {
  await endpointAuth.admin(headers)

  const projects = await db.project.findMany({
    select: {
      slug: true,
      subTitle: true,
      updatedAt: true,
      subsubsectionExtraFieldDefinitions: true,
    },
    orderBy: { slug: "asc" },
  })

  return projects.map((project) => ({
    projectSlug: project.slug,
    projectSubTitle: project.subTitle,
    fieldCount: parseDefinitions(project.subsubsectionExtraFieldDefinitions).length,
    updatedAt: project.updatedAt,
  }))
}

export async function getSubsubsectionExtraFieldValueCounts(
  headers: Headers,
  input: z.infer<typeof GetSubsubsectionExtraFieldValueCountsSchema>,
) {
  await endpointAuth.admin(headers)

  const subsubsections = await db.subsubsection.findMany({
    where: { subsection: { project: { slug: input.projectSlug } } },
    select: { extraFields: true },
  })

  const counts: Record<string, number> = {}
  for (const fieldName of input.fieldNames) {
    counts[fieldName] = 0
  }

  for (const subsubsection of subsubsections) {
    const values = parseExtraFields(subsubsection.extraFields)
    for (const fieldName of input.fieldNames) {
      if (values[fieldName]) {
        counts[fieldName] = (counts[fieldName] ?? 0) + 1
      }
    }
  }

  return counts
}

export async function updateProjectSubsubsectionExtraFieldDefinitions(
  headers: Headers,
  input: z.infer<typeof UpdateProjectSubsubsectionExtraFieldDefinitionsSchema>,
) {
  await endpointAuth.admin(headers)

  const project = await db.project.findFirstOrThrow({
    where: { slug: input.projectSlug },
    select: { id: true, subsubsectionExtraFieldDefinitions: true },
  })

  const previousDefinitions = parseDefinitions(project.subsubsectionExtraFieldDefinitions)
  const removedNames = getRemovedDefinitionNames(previousDefinitions, input.definitions)

  return db.$transaction(async (tx) => {
    const updatedProject = await tx.project.update({
      where: { id: project.id },
      data: {
        subsubsectionExtraFieldDefinitions: input.definitions as Prisma.InputJsonValue,
      },
      select: {
        slug: true,
        subsubsectionExtraFieldDefinitions: true,
      },
    })

    if (removedNames.length === 0) {
      return updatedProject
    }

    await tx.$executeRaw`
      UPDATE "Subsubsection" AS ss
      SET "extraFields" = ss."extraFields" - ${removedNames}::text[]
      FROM "Subsection" AS sub
      WHERE ss."subsectionId" = sub.id
        AND sub."projectId" = ${project.id}
    `

    return updatedProject
  })
}
