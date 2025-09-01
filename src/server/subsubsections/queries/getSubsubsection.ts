import db, { QualityLevel, Subsubsection, SubsubsectionTypeEnum, User } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
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

// We lie with TypeScript here, because we know better. All `geometry` fields are Position. We make sure of that in our Form. They are also required, so never empty.
export type SubsubsectionWithPosition = Omit<Subsubsection, "geometry"> &
  (
    | {
        type: typeof SubsubsectionTypeEnum.AREA
        geometry: [number, number] // Position
      }
    | {
        type: typeof SubsubsectionTypeEnum.ROUTE
        geometry: [number, number][] // Position[]
      }
  ) & { manager: User } & { subsection: { slug: string } } & {
    qualityLevel?: Pick<QualityLevel, "title" | "slug" | "url">
  } & { SubsubsectionTask?: { title: string } }

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
        ...includeM2mFields,
      },
    }

    const subsubsection = await db.subsubsection.findFirstOrThrow(query)
    return subsubsection as SubsubsectionWithPosition // Tip: Validate type shape with `satisfies`
  },
)
