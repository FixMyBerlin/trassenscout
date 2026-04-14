import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { typeDealAreaGeometry } from "@/src/server/dealAreas/utils/typeDealAreaGeometry"
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

    return typeDealAreaGeometry(dealArea)
  },
)
