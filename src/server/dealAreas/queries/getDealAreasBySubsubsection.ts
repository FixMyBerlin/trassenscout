import db, { DealArea } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { typeDealAreaGeometry } from "@/src/server/dealAreas/utils/typeDealAreaGeometry"
import { GeometryByGeometryType } from "@/src/server/shared/utils/geometrySchemas"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const GetDealAreasBySubsubsectionSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    subsubsectionId: z.coerce.number(),
  }),
)

export type DealAreaWithTypedGeometry = Omit<DealArea, "geometry"> & {
  geometry: GeometryByGeometryType<"POLYGON">
  parcel: {
    id: number
    alkisParcelId: string
    alkisParcelIdSource: string
    geometry: GeometryByGeometryType<"POLYGON">
  }
  dealAreaStatus: {
    id: number
    slug: string
    title: string
    style: number
  } | null
}

export default resolver.pipe(
  resolver.zod(GetDealAreasBySubsubsectionSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, subsubsectionId }) => {
    const dealAreas = await db.dealArea.findMany({
      where: {
        subsubsectionId,
        subsubsection: {
          subsection: {
            project: {
              slug: projectSlug,
            },
          },
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
        dealAreaStatus: {
          select: {
            id: true,
            slug: true,
            title: true,
            style: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    })

    return dealAreas.map((dealArea) => typeDealAreaGeometry(dealArea) as DealAreaWithTypedGeometry)
  },
)
