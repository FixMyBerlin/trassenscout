import { length, lineString } from "@turf/turf"
import { z } from "zod"
import type { Prisma } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { NotFoundError } from "@/src/shared/auth/errors"
import {
  CreateSubsectionSchema,
  CreateSubsectionsSchema,
  DeleteSubsectionSchema,
  GetSubsectionBySlugSchema,
  GetSubsectionSchema,
  GetSubsectionsSchema,
  SubsectionInputSchema,
  UpdateSubsectionSchema,
  UpdateSubsectionsWithPlacemarkSchema,
} from "./subsections.inputSchemas"
import { multilinestringToLinestring } from "./utils/multilinestringToLinestring"
import { typeSubsectionGeometry } from "./utils/typeSubsectionGeometry"

function subsectionInProjectWhere(projectSlug: string, id: number) {
  return { id, project: { slug: projectSlug } }
}

async function validateSubsectionRelations(
  projectSlug: string,
  input: z.infer<typeof SubsectionInputSchema>,
) {
  await Promise.all([
    input.operatorId
      ? db.operator.findFirstOrThrow({
          where: { id: input.operatorId, project: { slug: projectSlug } },
          select: { id: true },
        })
      : undefined,
    input.networkHierarchyId
      ? db.networkHierarchy.findFirstOrThrow({
          where: { id: input.networkHierarchyId, project: { slug: projectSlug } },
          select: { id: true },
        })
      : undefined,
    input.subsectionStatusId
      ? db.subsectionStatus.findFirstOrThrow({
          where: { id: input.subsectionStatusId, project: { slug: projectSlug } },
          select: { id: true },
        })
      : undefined,
  ])
}

function subsectionData(input: z.infer<typeof SubsectionInputSchema>, projectId: number) {
  return {
    ...input,
    geometry: input.geometry as Prisma.InputJsonValue,
    projectId,
  }
}

export async function getSubsections(
  headers: Headers,
  input: z.infer<typeof GetSubsectionsSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const subsections = await db.subsection.findMany({
    orderBy: { order: "asc" },
    where: { project: { slug: input.projectSlug } },
    include: {
      operator: { select: { id: true, slug: true, title: true } },
      subsubsections: { select: { id: true } },
      SubsectionStatus: { select: { slug: true, title: true, style: true } },
    },
  })

  return subsections.map((subsection) => {
    const subsubsectionCount = subsection.subsubsections.length
    const { subsubsections: _subsubsections, ...typedSubsection } =
      typeSubsectionGeometry(subsection)
    return { ...typedSubsection, subsubsectionCount }
  })
}

export async function getSubsection(headers: Headers, input: z.infer<typeof GetSubsectionSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  return db.subsection.findFirstOrThrow({
    where: subsectionInProjectWhere(input.projectSlug, input.id),
  })
}

export async function getSubsectionBySlug(
  headers: Headers,
  input: z.infer<typeof GetSubsectionBySlugSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const subsection = await db.subsection.findFirst({
    where: {
      slug: input.subsectionSlug,
      project: { slug: input.projectSlug },
    },
    include: {
      operator: { select: { id: true, slug: true, title: true } },
      subsubsections: { select: { id: true } },
      SubsectionStatus: { select: { slug: true, title: true, style: true } },
    },
  })
  if (!subsection) throw new NotFoundError()

  const subsubsectionCount = subsection.subsubsections.length
  const { subsubsections: _subsubsections, ...typedSubsection } = typeSubsectionGeometry(subsection)

  return { ...typedSubsection, subsubsectionCount }
}

export async function getSubsectionMaxOrder(
  headers: Headers,
  input: z.infer<typeof GetSubsectionsSchema>,
) {
  const { projectId } = await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const maxOrder = await db.subsection.aggregate({
    _max: { order: true },
    where: { projectId },
  })

  return maxOrder._max.order
}

export async function createSubsection(
  headers: Headers,
  input: z.infer<typeof CreateSubsectionSchema>,
) {
  const { projectId } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { projectSlug, ...data } = input
  await validateSubsectionRelations(projectSlug, data)

  return db.subsection.create({
    data: subsectionData(data, projectId),
  })
}

export async function updateSubsection(
  headers: Headers,
  input: z.infer<typeof UpdateSubsectionSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug, ...data } = input
  await validateSubsectionRelations(projectSlug, data)
  const previous = await db.subsection.findFirstOrThrow({
    where: subsectionInProjectWhere(projectSlug, id),
    select: { id: true, projectId: true },
  })

  return db.subsection.update({
    where: { id: previous.id },
    data: subsectionData(data, previous.projectId),
  })
}

export async function deleteSubsection(
  headers: Headers,
  input: z.infer<typeof DeleteSubsectionSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  return db.subsection.deleteMany({
    where: subsectionInProjectWhere(input.projectSlug, input.id),
  })
}

export async function createSubsections(
  headers: Headers,
  input: z.infer<typeof CreateSubsectionsSchema>,
) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { projectSlug, subsections } = input

  const records = await db.subsection.createMany({
    data: subsections.map((subsection) => ({
      ...subsection,
      geometry: subsection.geometry as Prisma.InputJsonValue,
    })),
  })

  await createLogEntry({
    action: "CREATE",
    message: `${subsections.length} Planungsabschnitte erstellt`,
    userId: Number(session.userId),
    projectSlug,
  })

  return records
}

export async function updateSubsectionsWithPlacemark(
  headers: Headers,
  input: z.infer<typeof UpdateSubsectionsWithPlacemarkSchema>,
) {
  const session = await endpointAuth.admin(headers)
  const { subsections, newGeometry, projectSlug } = input
  const updatedSubsectionIds: number[] = []
  const placemarkSubsections = newGeometry.features

  for (const tsSubsection of subsections) {
    const matchingPlacemarkSubsection = placemarkSubsections.find(
      (feature) => feature?.properties.subsectionSlug === tsSubsection.slug,
    )

    if (!matchingPlacemarkSubsection) continue

    const newCoordinates =
      matchingPlacemarkSubsection.geometry.type === "MultiLineString"
        ? multilinestringToLinestring(
            matchingPlacemarkSubsection.geometry.coordinates as Array<Array<[number, number]>>,
          )
        : matchingPlacemarkSubsection.geometry.type === "LineString"
          ? matchingPlacemarkSubsection.geometry.coordinates
          : tsSubsection.geometry.coordinates

    const updatedSubsection = await db.subsection.update({
      where: { id: tsSubsection.id },
      data: {
        geometry: { type: "LineString", coordinates: newCoordinates },
        lengthM: newCoordinates
          ? Number(
              (
                length(lineString(newCoordinates as [number, number][]), { units: "kilometers" }) *
                1000
              ).toFixed(0),
            )
          : 0,
      },
    })

    updatedSubsectionIds.push(updatedSubsection.id)
  }

  if (updatedSubsectionIds.length > 0) {
    await createLogEntry({
      action: "UPDATE",
      message: `Geometrien von ${updatedSubsectionIds.length} Planungsabschnitte aktualisiert`,
      userId: Number(session.userId),
      projectSlug,
    })
  }

  return updatedSubsectionIds
}
