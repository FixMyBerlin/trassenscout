import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { GeometryByGeometryType } from "@/src/server/shared/utils/geometrySchemas"
import { typeSubsectionGeometry } from "@/src/server/subsections/utils/typeSubsectionGeometry"
import { resolver } from "@blitzjs/rpc"
import { GeometryTypeEnum } from "@prisma/client"
import { NotFoundError } from "blitz"
import { z } from "zod"
import getSubsection from "./getSubsection"

type SubsectionGeometryWithTypeDiscriminated =
  | {
      type: typeof GeometryTypeEnum.LINE
      geometry: GeometryByGeometryType<"LINE">
    }
  | {
      type: typeof GeometryTypeEnum.POLYGON
      geometry: GeometryByGeometryType<"POLYGON">
    }

export type TGetSubsection = Omit<Awaited<ReturnType<typeof getSubsection>>, "type" | "geometry"> &
  SubsectionGeometryWithTypeDiscriminated & {
    stakeholdernotesCounts: { relevant: number; done: number }
    subsubsectionCount: number
  }

export const GetSubsectionSchema = z.object({
  projectSlug: z.string(),
  subsectionSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(GetSubsectionSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, subsectionSlug }) => {
    const query = {
      where: {
        slug: subsectionSlug,
        project: {
          slug: projectSlug,
        },
      },
      include: {
        operator: { select: { id: true, slug: true, title: true } },
        stakeholdernotes: { select: { id: true, status: true } },
        subsubsections: { select: { id: true } },
        SubsectionStatus: { select: { slug: true, title: true, style: true } },
      },
    }
    const subsection = await db.subsection.findFirst(query)
    if (!subsection) throw new NotFoundError()

    const relevantStakeholdernotes = subsection.stakeholdernotes.filter(
      (note) => note.status !== "IRRELEVANT",
    ).length

    const doneStakeholdernotes = subsection.stakeholdernotes.filter(
      (note) => note.status === "DONE",
    ).length

    const subsubsectionCount = subsection.subsubsections.length

    const {
      stakeholdernotes: _delete1,
      subsubsections: _delete2,
      ...typedSubsection
    } = typeSubsectionGeometry(subsection)

    const subsectionWithCounts = {
      ...typedSubsection,
      stakeholdernotesCounts: { relevant: relevantStakeholdernotes, done: doneStakeholdernotes },
      subsubsectionCount,
    }

    return subsectionWithCounts
  },
)
