import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { typeAcquisitionAreaGeometry } from "@/src/server/acquisitionAreas/utils/typeAcquisitionAreaGeometry"
import { typeGeometry } from "@/src/server/shared/utils/typeGeometry"
import { resolver } from "@blitzjs/rpc"
import { GeometryTypeEnum } from "@prisma/client"
import { z } from "zod"

const GetAcquisitionAreaSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    id: z.number().optional().refine(Boolean, "Required"),
  }),
)

export default resolver.pipe(
  resolver.zod(GetAcquisitionAreaSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ id, projectSlug }) => {
    const acquisitionArea = await db.acquisitionArea.findFirstOrThrow({
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
        acquisitionAreaStatus: {
          select: {
            id: true,
            slug: true,
            title: true,
            style: true,
          },
        },
      },
    })

    const typedAcquisitionArea = typeAcquisitionAreaGeometry(acquisitionArea)

    return {
      ...typedAcquisitionArea,
      parcel: {
        ...typedAcquisitionArea.parcel,
        geometry: typeGeometry(typedAcquisitionArea.parcel.geometry, ["POLYGON"]),
      },
      subsubsection: {
        ...typedAcquisitionArea.subsubsection,
        geometry: typeGeometry(typedAcquisitionArea.subsubsection.geometry, [
          GeometryTypeEnum.POINT,
          GeometryTypeEnum.LINE,
          GeometryTypeEnum.POLYGON,
        ]),
      },
    }
  },
)
