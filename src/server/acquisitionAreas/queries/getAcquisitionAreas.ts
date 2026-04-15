import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  resolver.zod(ProjectSlugRequiredSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug }) => {
    return db.acquisitionArea.findMany({
      where: {
        subsubsection: {
          subsection: {
            project: {
              slug: projectSlug,
              landAcquisitionModuleEnabled: true,
            },
          },
        },
      },
      select: {
        id: true,
        subsubsectionId: true,
        subsubsection: {
          select: {
            slug: true,
            subsectionId: true,
            subsection: {
              select: {
                slug: true,
              },
            },
          },
        },
        parcel: {
          select: {
            alkisParcelId: true,
          },
        },
      },
      orderBy: [
        { subsubsection: { subsection: { slug: "asc" } } },
        { subsubsection: { slug: "asc" } },
        { id: "asc" },
      ],
    })
  },
)
