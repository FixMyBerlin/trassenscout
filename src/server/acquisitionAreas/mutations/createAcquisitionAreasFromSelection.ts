import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { InputNumberOrNullSchema } from "@/src/core/utils/schema-shared"
import { AcquisitionAreaGeometrySchema } from "@/src/server/acquisitionAreas/schema"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const CreateAcquisitionAreasFromSelectionSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    subsubsectionId: z.coerce.number(),
    acquisitionAreas: z
      .array(
        z.object({
          alkisParcelId: z.string().trim().min(1, "alkisParcelId is required"),
          alkisParcelIdSource: z.string(),
          geometry: AcquisitionAreaGeometrySchema,
          parcelGeometry: AcquisitionAreaGeometrySchema,
          bufferRadiusM: InputNumberOrNullSchema,
          description: z.string().nullish(),
          acquisitionAreaStatusId: z.coerce.number().nullish(),
          mode: z.enum(["create", "update", "keep"]).default("create"),
        }),
      )
      .min(1, "At least one acquisition area is required"),
  }),
)

export default resolver.pipe(
  resolver.zod(CreateAcquisitionAreasFromSelectionSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, subsubsectionId, acquisitionAreas }, ctx: Ctx) => {
    await db.subsubsection.findFirstOrThrow({
      where: {
        id: subsubsectionId,
        subsection: {
          project: {
            slug: projectSlug,
          },
        },
      },
      select: { id: true },
    })

    const acquisitionAreaStatusIds = Array.from(
      new Set(
        acquisitionAreas
          .map((acquisitionArea) => acquisitionArea.acquisitionAreaStatusId ?? null)
          .filter((acquisitionAreaStatusId): acquisitionAreaStatusId is number =>
            Boolean(acquisitionAreaStatusId),
          ),
      ),
    )

    if (acquisitionAreaStatusIds.length > 0) {
      const validStatuses = await db.acquisitionAreaStatus.findMany({
        where: {
          id: { in: acquisitionAreaStatusIds },
          project: {
            slug: projectSlug,
          },
        },
        select: { id: true },
      })

      if (validStatuses.length !== acquisitionAreaStatusIds.length) {
        throw new Error("One or more acquisition area statuses are invalid for this project")
      }
    }

    const alkisParcelIds = Array.from(
      new Set(acquisitionAreas.map((acquisitionArea) => acquisitionArea.alkisParcelId)),
    )
    const existingParcels = await db.parcel.findMany({
      where: {
        alkisParcelId: {
          in: alkisParcelIds,
        },
      },
      select: {
        alkisParcelId: true,
      },
    })
    const existingParcelIdSet = new Set(existingParcels.map((parcel) => parcel.alkisParcelId))

    const result = await db.$transaction(async (tx) => {
      const createdAcquisitionAreas = []
      let updatedAcquisitionAreasCount = 0
      let keptAcquisitionAreasCount = 0
      const createdParcelIds = new Set<string>()
      const updatedParcelIds = new Set<string>()

      const existingAcquisitionAreas = await tx.acquisitionArea.findMany({
        where: {
          subsubsectionId,
          parcel: {
            alkisParcelId: {
              in: alkisParcelIds,
            },
          },
        },
        select: {
          id: true,
          parcel: {
            select: {
              alkisParcelId: true,
            },
          },
        },
      })
      const existingAcquisitionAreasByAlkisParcelId = new Map(
        existingAcquisitionAreas.map((acquisitionArea) => [
          acquisitionArea.parcel.alkisParcelId,
          acquisitionArea.id,
        ]),
      )

      for (const acquisitionArea of acquisitionAreas) {
        const parcel = await tx.parcel.upsert({
          where: {
            alkisParcelId: acquisitionArea.alkisParcelId,
          },
          create: {
            alkisParcelId: acquisitionArea.alkisParcelId,
            alkisParcelIdSource: acquisitionArea.alkisParcelIdSource,
            geometry: acquisitionArea.parcelGeometry,
          },
          update: {
            geometry: acquisitionArea.parcelGeometry,
            alkisParcelIdSource: acquisitionArea.alkisParcelIdSource,
          },
          select: {
            id: true,
            alkisParcelId: true,
          },
        })

        if (existingParcelIdSet.has(acquisitionArea.alkisParcelId)) {
          updatedParcelIds.add(acquisitionArea.alkisParcelId)
        } else {
          createdParcelIds.add(acquisitionArea.alkisParcelId)
          existingParcelIdSet.add(acquisitionArea.alkisParcelId)
        }

        const existingAcquisitionAreaId = existingAcquisitionAreasByAlkisParcelId.get(
          acquisitionArea.alkisParcelId,
        )

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
            select: { id: true },
          })
          updatedAcquisitionAreasCount += 1
          continue
        }

        if (acquisitionArea.mode === "create" && existingAcquisitionAreaId) {
          keptAcquisitionAreasCount += 1
          continue
        }

        const createdAcquisitionArea = await tx.acquisitionArea.create({
          data: {
            subsubsectionId,
            parcelId: parcel.id,
            geometry: acquisitionArea.geometry,
            bufferRadiusM: acquisitionArea.bufferRadiusM ?? null,
            description: acquisitionArea.description ?? null,
            acquisitionAreaStatusId: acquisitionArea.acquisitionAreaStatusId ?? null,
          },
          select: {
            id: true,
            parcelId: true,
          },
        })

        createdAcquisitionAreas.push(createdAcquisitionArea)
        existingAcquisitionAreasByAlkisParcelId.set(
          acquisitionArea.alkisParcelId,
          createdAcquisitionArea.id,
        )
      }

      return {
        createdAcquisitionAreas,
        updatedAcquisitionAreasCount,
        keptAcquisitionAreasCount,
        createdParcelsCount: createdParcelIds.size,
        updatedParcelsCount: updatedParcelIds.size,
      }
    })

    const parcelParts = [`${result.createdParcelsCount} Flurstücke neu angelegt`]
    if (result.updatedParcelsCount > 0) {
      parcelParts.push(`${result.updatedParcelsCount} Flurstücke aktualisiert`)
    }

    await createLogEntry({
      action: "CREATE",
      message: `${result.createdAcquisitionAreas.length} Erwerbsflächen erstellt, ${result.updatedAcquisitionAreasCount} aktualisiert, ${result.keptAcquisitionAreasCount} unverändert, ${parcelParts.join(", ")}`,
      userId: ctx.session.userId,
      projectSlug,
    })

    return result.createdAcquisitionAreas
  },
)
