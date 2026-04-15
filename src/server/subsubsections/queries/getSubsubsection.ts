import db, { QualityLevel, Subsubsection } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { GeometryWithTypeDiscriminated } from "@/src/server/shared/utils/geometrySchemas"
import { typeSubsubsectionGeometry } from "@/src/server/subsubsections/utils/typeSubsubsectionGeometry"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { m2mFieldRelationNames, m2mFields } from "../m2mFields"

const GetSubsubsection = z.object({
  projectSlug: z.string(),
  subsectionSlug: z.string(),
  subsubsectionSlug: z.string(),
})

const includeM2mFields: Record<string, { select: { id: true } }> = {}
// @ts-ignore
m2mFields.forEach((fieldName) => {
  includeM2mFields[m2mFieldRelationNames[fieldName]] = { select: { id: true } }
})

// We store full GeoJSON geometry objects. The geometry type must match the enum type.
export type SubsubsectionWithPosition = Omit<Subsubsection, "geometry" | "type"> &
  GeometryWithTypeDiscriminated & {
    manager: { firstName: string; lastName: string } | null
  } & { subsection: { slug: string; project: { landAcquisitionModuleEnabled: boolean } } } & {
    qualityLevel?: Pick<QualityLevel, "title" | "slug" | "url">
  } & { SubsubsectionTask?: { title: string } } & {
    SubsubsectionInfrastructureTypes: { id: number; title: string; slug: string }[]
  } & { SubsubsectionStatus?: { title: string; slug: string; style: string } } & {
    SubsubsectionInfra?: { title: string; slug: string }
  }

export type TGetSubsubsection = Awaited<ReturnType<typeof getSubsubsection>>

const getSubsubsection = resolver.pipe(
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
        ...includeM2mFields,
        manager: { select: { firstName: true, lastName: true } },
        subsection: {
          select: {
            slug: true,
            project: { select: { landAcquisitionModuleEnabled: true } },
          },
        },
        qualityLevel: { select: { title: true, slug: true, url: true } },
        SubsubsectionTask: { select: { title: true } },
        SubsubsectionInfrastructureTypes: { select: { id: true, title: true, slug: true } },
        SubsubsectionInfra: { select: { title: true, slug: true } },
        SubsubsectionStatus: { select: { title: true, slug: true, style: true } },
      },
    }

    const subsubsection = await db.subsubsection.findFirstOrThrow(query)
    // tbd
    // with invoke() we get a type error here when we use the return value in the client component
    // Type assertion needed: TypeScript can't infer the discriminated union relationship
    // between `type` and `geometry` fields, even though typeSubsubsectionGeometry ensures
    // they match at runtime.
    return typeSubsubsectionGeometry(subsubsection) as SubsubsectionWithPosition
  },
)

export default getSubsubsection
