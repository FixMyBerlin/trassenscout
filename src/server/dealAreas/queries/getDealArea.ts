import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { typeDealAreaGeometry } from "@/src/server/dealAreas/utils/typeDealAreaGeometry"
import { typeGeometry } from "@/src/server/shared/utils/typeGeometry"
import { GeometryTypeEnum } from "@prisma/client"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const GetDealAreaSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    id: z.number().optional().refine(Boolean, "Required"),
  }),
)

export default resolver.pipe(
  resolver.zod(GetDealAreaSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ id, projectSlug }) => {
    const dealArea = await db.dealArea.findFirstOrThrow({
      where: {
        id,
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
        subsubsection: {
          select: {
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
    })

    const typedDealArea = typeDealAreaGeometry(dealArea)

    return {
      ...typedDealArea,
      parcel: {
        ...typedDealArea.parcel,
        geometry: typeGeometry(typedDealArea.parcel.geometry, ["POLYGON"]),
      },
      subsubsection: {
        ...typedDealArea.subsubsection,
        geometry: typeGeometry(typedDealArea.subsubsection.geometry, [
          GeometryTypeEnum.POINT,
          GeometryTypeEnum.LINE,
          GeometryTypeEnum.POLYGON,
        ]),
      },
    }
  },
)
