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
      },
      // todo
      // orderBy: { id: "desc" },
      include: {
        protocolTopics: true,
        subsection: true,
      },
    })

    return protocols
  },
)
