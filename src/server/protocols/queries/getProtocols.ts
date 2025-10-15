import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import db from "db"

type GetProtocolsInput = { projectSlug: string }

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug }: GetProtocolsInput) => {
    const protocols = await db.protocol.findMany({
      where: {
        project: { slug: projectSlug },
        reviewState: { in: ["NEEDSREVIEW", "APPROVED"] }, // Only show reviewed or approved protocols to normal users
      },
      orderBy: { date: "desc" },
      include: {
        protocolTopics: true,
        subsection: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return protocols
  },
)
