import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { DealAreaGeometrySchema } from "@/src/server/dealAreas/schema"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const CreateDealAreasFromSelectionSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    subsubsectionId: z.coerce.number(),
    dealAreas: z
      .array(
        z.object({
          alkisParcelId: z.string().trim().min(1, "alkisParcelId is required"),
          alkisParcelIdSource: z.string(),
          geometry: DealAreaGeometrySchema,
          parcelGeometry: DealAreaGeometrySchema,
          description: z.string().nullish(),
          dealAreaStatusId: z.coerce.number().nullish(),
        }),
      )
      .min(1, "At least one deal area is required"),
  }),
)

export default resolver.pipe(
  resolver.zod(CreateDealAreasFromSelectionSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, subsubsectionId, dealAreas }, ctx: Ctx) => {
    await db.subsubsection.findFirstOrThrow({
      where: {
        id: subsubsectionId,
        type: { in: ["LINE", "POLYGON"] },
        subsection: {
          project: {
            slug: projectSlug,
          },
        },
      },
      select: { id: true },
    })

    const dealAreaStatusIds = Array.from(
      new Set(
        dealAreas
          .map((dealArea) => dealArea.dealAreaStatusId ?? null)
          .filter((dealAreaStatusId): dealAreaStatusId is number => Boolean(dealAreaStatusId)),
      ),
    )

    if (dealAreaStatusIds.length > 0) {
      const validStatuses = await db.dealAreaStatus.findMany({
        where: {
          id: { in: dealAreaStatusIds },
          project: {
            slug: projectSlug,
          },
        },
        select: { id: true },
      })

      if (validStatuses.length !== dealAreaStatusIds.length) {
        throw new Error("One or more deal area statuses are invalid for this project")
      }
    }

    const alkisParcelIds = Array.from(new Set(dealAreas.map((dealArea) => dealArea.alkisParcelId)))
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
      const createdDealAreas = []
      const createdParcelIds = new Set<string>()
      const updatedParcelIds = new Set<string>()

      for (const dealArea of dealAreas) {
        const parcel = await tx.parcel.upsert({
          where: {
            alkisParcelId: dealArea.alkisParcelId,
          },
          create: {
            alkisParcelId: dealArea.alkisParcelId,
            alkisParcelIdSource: dealArea.alkisParcelIdSource,
            geometry: dealArea.parcelGeometry,
          },
          update: {
            geometry: dealArea.parcelGeometry,
            alkisParcelIdSource: dealArea.alkisParcelIdSource,
          },
          select: {
            id: true,
            alkisParcelId: true,
            alkisParcelIdSource: true,
            geometry: true,
          },
        })

        if (existingParcelIdSet.has(dealArea.alkisParcelId)) {
          updatedParcelIds.add(dealArea.alkisParcelId)
        } else {
          createdParcelIds.add(dealArea.alkisParcelId)
          existingParcelIdSet.add(dealArea.alkisParcelId)
        }

        const createdDealArea = await tx.dealArea.create({
          data: {
            subsubsectionId,
            parcelId: parcel.id,
            geometry: dealArea.geometry,
            description: dealArea.description ?? null,
            dealAreaStatusId: dealArea.dealAreaStatusId ?? null,
          },
          select: {
            id: true,
            parcelId: true,
          },
        })

        createdDealAreas.push(createdDealArea)
      }

      return {
        createdDealAreas,
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
      message: `${result.createdDealAreas.length} Erwerbsflächen erstellt, ${parcelParts.join(", ")}`,
      userId: ctx.session.userId,
      projectSlug,
    })

    return result.createdDealAreas
  },
)
