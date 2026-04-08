import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { DealAreaGeometrySchema } from "@/src/server/dealAreas/schema"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const CreateDealAreasFromSelectionSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    subsubsectionId: z.coerce.number(),
    dealAreas: z
      .array(
        z.object({
          gmlId: z.string().trim().min(1, "gmlId is required"),
          geometry: DealAreaGeometrySchema,
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
  async ({ projectSlug, subsubsectionId, dealAreas }) => {
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

    return await db.$transaction(async (tx) => {
      const createdDealAreas = []

      for (const dealArea of dealAreas) {
        const parcel = await tx.parcel.upsert({
          where: {
            gmlId: dealArea.gmlId,
          },
          create: {
            gmlId: dealArea.gmlId,
          },
          update: {},
          select: {
            id: true,
            gmlId: true,
          },
        })

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

      return createdDealAreas
    })
  },
)
