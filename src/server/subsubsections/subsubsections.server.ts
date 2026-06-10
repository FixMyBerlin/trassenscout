import { z } from "zod"
import type { Prisma } from "@/src/prisma/generated/client"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { connectIds, idsFromFormValue, setIds } from "@/src/shared/prisma/connectIds"
import { SubsubsectionSchema } from "@/src/shared/subsubsections/schemas"
import { m2mFieldRelationNames, m2mFields } from "./m2mFields"
import {
  CreateSubsubsectionSchema,
  DeleteSubsubsectionSchema,
  GetSubsubsectionBySlugSchema,
  GetSubsubsectionSchema,
  GetSubsubsectionsSchema,
  UpdateSubsubsectionSchema,
} from "./subsubsections.inputSchemas"
import type { SubsubsectionWithPosition } from "./types"
import { typeSubsubsectionGeometry } from "./utils/typeSubsubsectionGeometry"

const subsubsectionListInclude = {
  manager: { select: { firstName: true, lastName: true } },
  subsection: { select: { id: true, slug: true } },
  qualityLevel: { select: { title: true, slug: true, url: true } },
  SubsubsectionTask: { select: { title: true } },
  SubsubsectionInfrastructureTypes: { select: { id: true, title: true, slug: true } },
  SubsubsectionStatus: { select: { title: true, slug: true, style: true } },
  SubsubsectionInfra: { select: { title: true, slug: true } },
  specialFeatures: { select: { id: true, title: true } },
} as const

const subsubsectionDetailInclude = {
  ...subsubsectionListInclude,
  subsection: {
    select: {
      slug: true,
      project: { select: { landAcquisitionModuleEnabled: true } },
    },
  },
  ...Object.fromEntries(
    m2mFields.map((fieldName) => [
      m2mFieldRelationNames[fieldName],
      { select: { id: true, title: true, slug: true } },
    ]),
  ),
} as const

type SubsubsectionInput = z.infer<typeof SubsubsectionSchema>

function subsubsectionInProjectWhere(projectSlug: string, id: number) {
  return { id, subsection: { project: { slug: projectSlug } } }
}

async function validateSubsubsectionRelations(projectSlug: string, input: SubsubsectionInput) {
  const infrastructureTypeIds = idsFromFormValue(input.subsubsectionInfrastructureTypeIds)
  const specialFeatureIds = idsFromFormValue(input.specialFeatures)

  await Promise.all([
    db.subsection.findFirstOrThrow({
      where: { id: input.subsectionId, project: { slug: projectSlug } },
      select: { id: true },
    }),
    input.qualityLevelId
      ? db.qualityLevel.findFirstOrThrow({
          where: { id: input.qualityLevelId, project: { slug: projectSlug } },
          select: { id: true },
        })
      : undefined,
    input.subsubsectionStatusId
      ? db.subsubsectionStatus.findFirstOrThrow({
          where: { id: input.subsubsectionStatusId, project: { slug: projectSlug } },
          select: { id: true },
        })
      : undefined,
    input.subsubsectionTaskId
      ? db.subsubsectionTask.findFirstOrThrow({
          where: { id: input.subsubsectionTaskId, project: { slug: projectSlug } },
          select: { id: true },
        })
      : undefined,
    input.subsubsectionInfraId
      ? db.subsubsectionInfra.findFirstOrThrow({
          where: { id: input.subsubsectionInfraId, project: { slug: projectSlug } },
          select: { id: true },
        })
      : undefined,
    infrastructureTypeIds.length
      ? db.subsubsectionInfrastructureType
          .findMany({
            where: { id: { in: infrastructureTypeIds }, project: { slug: projectSlug } },
            select: { id: true },
          })
          .then((records) => {
            if (records.length !== infrastructureTypeIds.length)
              throw new Error("Invalid infrastructure type")
          })
      : undefined,
    specialFeatureIds.length
      ? db.subsubsectionSpecial
          .findMany({
            where: { id: { in: specialFeatureIds }, project: { slug: projectSlug } },
            select: { id: true },
          })
          .then((records) => {
            if (records.length !== specialFeatureIds.length)
              throw new Error("Invalid special feature")
          })
      : undefined,
  ])
}

function subsubsectionData(input: SubsubsectionInput) {
  const { specialFeatures, subsubsectionInfrastructureTypeIds, ...data } = input

  return {
    ...data,
    geometry: data.geometry as Prisma.InputJsonValue,
    specialFeatures: connectIds(idsFromFormValue(specialFeatures)),
    SubsubsectionInfrastructureTypes: connectIds(
      idsFromFormValue(subsubsectionInfrastructureTypeIds),
    ),
  }
}

function subsubsectionUpdateData(input: SubsubsectionInput) {
  const { specialFeatures, subsubsectionInfrastructureTypeIds, ...data } = input

  return {
    ...data,
    geometry: data.geometry as Prisma.InputJsonValue,
    specialFeatures: setIds(idsFromFormValue(specialFeatures)),
    SubsubsectionInfrastructureTypes: setIds(idsFromFormValue(subsubsectionInfrastructureTypeIds)),
  }
}

export async function getSubsubsections(
  headers: Headers,
  input: z.infer<typeof GetSubsubsectionsSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const subsubsections = await db.subsubsection.findMany({
    orderBy: { slug: "asc" },
    where: {
      subsection: {
        project: { slug: input.projectSlug },
        ...(input.subsectionId ? { id: input.subsectionId } : {}),
      },
    },
    include: subsubsectionListInclude,
  })

  return subsubsections.map(
    (subsubsection) =>
      typeSubsubsectionGeometry(subsubsection) as unknown as SubsubsectionWithPosition,
  )
}

export async function getSubsubsection(
  headers: Headers,
  input: z.infer<typeof GetSubsubsectionSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const subsubsection = await db.subsubsection.findFirstOrThrow({
    where: subsubsectionInProjectWhere(input.projectSlug, input.id),
    include: subsubsectionDetailInclude,
  })

  return typeSubsubsectionGeometry(subsubsection) as SubsubsectionWithPosition
}

export async function getSubsubsectionBySlug(
  headers: Headers,
  input: z.infer<typeof GetSubsubsectionBySlugSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const subsubsection = await db.subsubsection.findFirstOrThrow({
    where: {
      slug: input.subsubsectionSlug,
      subsection: {
        slug: input.subsectionSlug,
        project: { slug: input.projectSlug },
      },
    },
    include: subsubsectionDetailInclude,
  })

  return typeSubsubsectionGeometry(subsubsection) as SubsubsectionWithPosition
}

export async function createSubsubsection(
  headers: Headers,
  input: z.infer<typeof CreateSubsubsectionSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { projectSlug, ...data } = input
  await validateSubsubsectionRelations(projectSlug, data)

  return db.subsubsection.create({
    data: subsubsectionData(data),
  })
}

export async function updateSubsubsection(
  headers: Headers,
  input: z.infer<typeof UpdateSubsubsectionSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug, ...data } = input
  await validateSubsubsectionRelations(projectSlug, data)
  const previous = await db.subsubsection.findFirstOrThrow({
    where: subsubsectionInProjectWhere(projectSlug, id),
    select: { id: true },
  })

  return db.subsubsection.update({
    where: { id: previous.id },
    data: subsubsectionUpdateData(data),
  })
}

export async function deleteSubsubsection(
  headers: Headers,
  input: z.infer<typeof DeleteSubsubsectionSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  return db.subsubsection.deleteMany({
    where: subsubsectionInProjectWhere(input.projectSlug, input.id),
  })
}
