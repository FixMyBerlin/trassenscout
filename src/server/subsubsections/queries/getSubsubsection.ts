import db, { QualityLevel, Subsubsection } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { GeometryWithTypeDiscriminated } from "@/src/server/shared/utils/geometrySchemas"
import { typeSubsubsectionGeometry } from "@/src/server/subsubsections/utils/typeSubsubsectionGeometry"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { m2mFields } from "../m2mFields"

const GetSubsubsection = z.object({
  projectSlug: z.string(),
  subsectionSlug: z.string(),
  subsubsectionSlug: z.string(),
})

const includeM2mFields = {}
// @ts-ignore
m2mFields.forEach((fieldName) => (includeM2mFields[fieldName] = { select: { id: true } }))

// We store full GeoJSON geometry objects. The geometry type must match the enum type.
export type SubsubsectionWithPosition = Omit<Subsubsection, "geometry" | "type"> &
  GeometryWithTypeDiscriminated & {
    manager: { firstName: string; lastName: string } | null
  } & { subsection: { slug: string } } & {
    qualityLevel?: Pick<QualityLevel, "title" | "slug" | "url">
  } & { SubsubsectionTask?: { title: string } } & {
    SubsubsectionInfrastructureType?: { title: string }
  } & { SubsubsectionStatus?: { title: string; slug: string; style: string } } & {
    SubsubsectionInfra?: { title: string; slug: string }
  }

export default resolver.pipe(
  resolver.zod(GetSubsubsection),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, subsectionSlug, subsubsectionSlug }) => {
    const query = {
      where: {
        slug: subsubsectionSlug,
        subsection: {
          slug: subsectionSlug,
          project: {
            slug: projectSlug,
          },
        },
      },
      include: {
        manager: { select: { firstName: true, lastName: true } },
        subsection: { select: { slug: true } },
        qualityLevel: { select: { title: true, slug: true, url: true } },
        SubsubsectionInfrastructureType: { select: { title: true } },
        SubsubsectionInfra: { select: { title: true, slug: true } },
        SubsubsectionStatus: { select: { title: true, slug: true, style: true } },
        ...includeM2mFields,
      },
    }

    const subsubsection = await db.subsubsection.findFirstOrThrow(query)
    return typeSubsubsectionGeometry(subsubsection)
  },
)
