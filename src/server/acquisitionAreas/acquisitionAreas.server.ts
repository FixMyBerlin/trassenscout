import { z } from "zod"
import type { Prisma } from "@/src/prisma/generated/client"
import { ProjectRecordReviewState } from "@/src/prisma/generated/client"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { AcquisitionAreaSchema } from "@/src/shared/acquisitionAreas/schemas"
import { NotFoundError } from "@/src/shared/auth/errors"
import { deleteAcquisitionAreasAndOrphanParcels } from "./_utils/deleteAcquisitionAreasAndOrphanParcels"
import { validateAcquisitionAreaInput } from "./_utils/validateAcquisitionAreaInput"
import {
  CreateAcquisitionAreaSchema,
  CreateAcquisitionAreasFromSelectionSchema,
  DeleteAcquisitionAreaSchema,
  DeleteAllAcquisitionAreasForSubsubsectionSchema,
  GetAcquisitionAreaSchema,
  GetAcquisitionAreasBySubsubsectionSchema,
  GetAcquisitionAreasSchema,
  UpdateAcquisitionAreaSchema,
} from "./acquisitionAreas.inputSchemas"
import type { AcquisitionAreaWithTypedGeometry } from "./types"
import { typeAcquisitionAreaGeometry } from "./utils/typeAcquisitionAreaGeometry"

type AcquisitionAreaInput = z.infer<typeof AcquisitionAreaSchema>

const acquisitionAreaInclude = {
  acquisitionAreaStatus: true,
  parcel: true,
  subsubsection: {
    include: {
      subsection: {
        select: { slug: true },
      },
    },
  },
} as const

function acquisitionAreaInProjectWhere(projectSlug: string, id: number) {
  return { id, subsubsection: { subsection: { project: { slug: projectSlug } } } }
}

function acquisitionAreaData(input: AcquisitionAreaInput) {
  return {
    ...input,
    geometry: input.geometry as Prisma.InputJsonValue,
  }
}

export async function getAcquisitionAreas(
  headers: Headers,
  input: z.infer<typeof GetAcquisitionAreasSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  return db.acquisitionArea.findMany({
    include: acquisitionAreaInclude,
    orderBy: { id: "asc" },
    where: {
      subsubsection: {
        ...(input.subsubsectionId ? { id: input.subsubsectionId } : {}),
        subsection: { project: { slug: input.projectSlug } },
      },
    },
  })
}

export async function getAcquisitionArea(
  headers: Headers,
  input: z.infer<typeof GetAcquisitionAreaSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  return db.acquisitionArea.findFirstOrThrow({
    include: acquisitionAreaInclude,
    where: acquisitionAreaInProjectWhere(input.projectSlug, input.id),
  })
}

export async function createAcquisitionArea(
  headers: Headers,
  input: z.infer<typeof CreateAcquisitionAreaSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { projectSlug, ...data } = input
  await validateAcquisitionAreaInput({ projectSlug, ...data })

  return db.acquisitionArea.create({
    data: acquisitionAreaData(data),
    include: acquisitionAreaInclude,
  })
}

export async function updateAcquisitionArea(
  headers: Headers,
  input: z.infer<typeof UpdateAcquisitionAreaSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug, ...data } = input
  await validateAcquisitionAreaInput({ projectSlug, ...data })
  const previous = await db.acquisitionArea.findFirstOrThrow({
    where: acquisitionAreaInProjectWhere(projectSlug, id),
    select: { id: true },
  })

  return db.acquisitionArea.update({
    where: { id: previous.id },
    data: acquisitionAreaData(data),
    include: acquisitionAreaInclude,
  })
}

export async function deleteAcquisitionArea(
  headers: Headers,
  input: z.infer<typeof DeleteAcquisitionAreaSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  return db.$transaction((tx) =>
    deleteAcquisitionAreasAndOrphanParcels(
      tx,
      acquisitionAreaInProjectWhere(input.projectSlug, input.id),
    ),
  )
}

export async function getAcquisitionAreasBySubsubsection(
  headers: Headers,
  input: z.infer<typeof GetAcquisitionAreasBySubsubsectionSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const acquisitionAreas = await db.acquisitionArea.findMany({
    where: {
      subsubsectionId: input.subsubsectionId,
      subsubsection: {
        subsection: { project: { slug: input.projectSlug } },
      },
    },
    include: {
      parcel: {
        select: {
          id: true,
          alkisParcelId: true,
          alkisParcelIdSource: true,
          geometry: true,
        },
      },
      acquisitionAreaStatus: {
        select: { id: true, slug: true, title: true, style: true },
      },
    },
    orderBy: { id: "asc" },
  })

  return acquisitionAreas.map(
    (acquisitionArea) =>
      typeAcquisitionAreaGeometry(acquisitionArea) as AcquisitionAreaWithTypedGeometry,
  )
}

export async function getAcquisitionAreasWithProjectRecordCountBySubsubsection(
  headers: Headers,
  input: z.infer<typeof GetAcquisitionAreasBySubsubsectionSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const acquisitionAreas = await db.acquisitionArea.findMany({
    where: {
      subsubsectionId: input.subsubsectionId,
      subsubsection: {
        subsection: { project: { slug: input.projectSlug } },
      },
    },
    select: {
      id: true,
      _count: {
        select: {
          projectRecords: {
            where: {
              reviewState: {
                in: [ProjectRecordReviewState.APPROVED, ProjectRecordReviewState.NEEDSREVIEW],
              },
            },
          },
        },
      },
    },
    orderBy: { id: "asc" },
  })

  return acquisitionAreas.map((acquisitionArea) => ({
    id: acquisitionArea.id,
    projectRecordCount: acquisitionArea._count.projectRecords,
  }))
}

export async function deleteAllAcquisitionAreasForSubsubsection(
  headers: Headers,
  input: z.infer<typeof DeleteAllAcquisitionAreasForSubsubsectionSchema>,
) {
  await endpointAuth.admin(headers)

  return db.$transaction(async (tx) => {
    const subsubsection = await tx.subsubsection.findFirst({
      where: {
        slug: input.subsubsectionSlug,
        subsection: {
          slug: input.subsectionSlug,
          project: { slug: input.projectSlug },
        },
      },
      select: { id: true },
    })
    if (!subsubsection) throw new NotFoundError()

    return deleteAcquisitionAreasAndOrphanParcels(tx, { subsubsectionId: subsubsection.id })
  })
}

export async function createAcquisitionAreasFromSelection(
  headers: Headers,
  input: z.infer<typeof CreateAcquisitionAreasFromSelectionSchema>,
) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { projectSlug, subsubsectionId, acquisitionAreas } = input

  await db.subsubsection.findFirstOrThrow({
    where: {
      id: subsubsectionId,
      subsection: { project: { slug: projectSlug } },
    },
    select: { id: true },
  })

  const acquisitionAreaStatusIds = Array.from(
    new Set(
      acquisitionAreas
        .map((area) => area.acquisitionAreaStatusId ?? null)
        .filter((id): id is number => Boolean(id)),
    ),
  )

  if (acquisitionAreaStatusIds.length > 0) {
    const validStatuses = await db.acquisitionAreaStatus.findMany({
      where: { id: { in: acquisitionAreaStatusIds }, project: { slug: projectSlug } },
      select: { id: true },
    })
    if (validStatuses.length !== acquisitionAreaStatusIds.length) {
      throw new Error("One or more acquisition area statuses are invalid for this project")
    }
  }

  const alkisParcelIds = Array.from(new Set(acquisitionAreas.map((area) => area.alkisParcelId)))
  const existingParcels = await db.parcel.findMany({
    where: { alkisParcelId: { in: alkisParcelIds } },
    select: { alkisParcelId: true },
  })
  const existingParcelIdSet = new Set(existingParcels.map((parcel) => parcel.alkisParcelId))

  const result = await db.$transaction(async (tx) => {
    const createdAcquisitionAreas = []
    let updatedAcquisitionAreasCount = 0
    let keptAcquisitionAreasCount = 0
    const createdParcelIds = new Set<string>()
    const updatedParcelIds = new Set<string>()

    const existingAcquisitionAreas = await tx.acquisitionArea.findMany({
      where: { subsubsectionId, parcel: { alkisParcelId: { in: alkisParcelIds } } },
      select: { id: true, parcel: { select: { alkisParcelId: true } } },
    })
    const existingByAlkisParcelId = new Map(
      existingAcquisitionAreas.map((area) => [area.parcel.alkisParcelId, area.id]),
    )

    for (const acquisitionArea of acquisitionAreas) {
      const parcel = await tx.parcel.upsert({
        where: { alkisParcelId: acquisitionArea.alkisParcelId },
        create: {
          alkisParcelId: acquisitionArea.alkisParcelId,
          alkisParcelIdSource: acquisitionArea.alkisParcelIdSource,
          geometry: acquisitionArea.parcelGeometry,
        },
        update: {
          geometry: acquisitionArea.parcelGeometry,
          alkisParcelIdSource: acquisitionArea.alkisParcelIdSource,
        },
        select: { id: true, alkisParcelId: true },
      })

      if (existingParcelIdSet.has(acquisitionArea.alkisParcelId)) {
        updatedParcelIds.add(acquisitionArea.alkisParcelId)
      } else {
        createdParcelIds.add(acquisitionArea.alkisParcelId)
        existingParcelIdSet.add(acquisitionArea.alkisParcelId)
      }

      const existingAcquisitionAreaId = existingByAlkisParcelId.get(acquisitionArea.alkisParcelId)

      if (acquisitionArea.mode === "keep" && existingAcquisitionAreaId) {
        keptAcquisitionAreasCount += 1
        continue
      }
      if (acquisitionArea.mode === "update" && existingAcquisitionAreaId) {
        await tx.acquisitionArea.update({
          where: { id: existingAcquisitionAreaId },
          data: {
            geometry: acquisitionArea.geometry,
            bufferRadiusM: acquisitionArea.bufferRadiusM ?? null,
          },
        })
        updatedAcquisitionAreasCount += 1
        continue
      }
      if (acquisitionArea.mode === "create" && existingAcquisitionAreaId) {
        keptAcquisitionAreasCount += 1
        continue
      }

      const created = await tx.acquisitionArea.create({
        data: {
          subsubsectionId,
          parcelId: parcel.id,
          geometry: acquisitionArea.geometry,
          bufferRadiusM: acquisitionArea.bufferRadiusM ?? null,
          description: acquisitionArea.description ?? null,
          acquisitionAreaStatusId: acquisitionArea.acquisitionAreaStatusId ?? null,
        },
        select: { id: true, parcelId: true },
      })
      createdAcquisitionAreas.push(created)
      existingByAlkisParcelId.set(acquisitionArea.alkisParcelId, created.id)
    }

    return {
      createdAcquisitionAreas,
      updatedAcquisitionAreasCount,
      keptAcquisitionAreasCount,
      createdParcelsCount: createdParcelIds.size,
      updatedParcelsCount: updatedParcelIds.size,
    }
  })

  await createLogEntry({
    action: "CREATE",
    message: `${result.createdAcquisitionAreas.length} Erwerbsflächen erstellt, ${result.updatedAcquisitionAreasCount} aktualisiert, ${result.keptAcquisitionAreasCount} unverändert`,
    userId: Number(session.userId),
    projectSlug,
  })

  return result.createdAcquisitionAreas
}
