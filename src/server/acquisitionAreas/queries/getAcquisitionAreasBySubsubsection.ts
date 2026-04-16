import db, { AcquisitionArea } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { typeAcquisitionAreaGeometry } from "@/src/server/acquisitionAreas/utils/typeAcquisitionAreaGeometry"
import { GeometryByGeometryType } from "@/src/server/shared/utils/geometrySchemas"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const GetAcquisitionAreasBySubsubsectionSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    subsubsectionId: z.coerce.number(),
  }),
)

export type AcquisitionAreaWithTypedGeometry = Omit<AcquisitionArea, "geometry"> & {
  geometry: GeometryByGeometryType<"POLYGON">
  parcel: {
    id: number
    alkisParcelId: string
    alkisParcelIdSource: string
    geometry: GeometryByGeometryType<"POLYGON">
  }
  acquisitionAreaStatus: {
    id: number
    slug: string
    title: string
    style: number
  } | null
}

export default resolver.pipe(
  resolver.zod(GetAcquisitionAreasBySubsubsectionSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, subsubsectionId }) => {
    const acquisitionAreas = await db.acquisitionArea.findMany({
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
        acquisitionAreaStatus: {
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

    return acquisitionAreas.map(
      (acquisitionArea) =>
        typeAcquisitionAreaGeometry(acquisitionArea) as AcquisitionAreaWithTypedGeometry,
    )
  },
)
