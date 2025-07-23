import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetProtocol = ProjectSlugRequiredSchema.merge(
  z.object({
    // This accepts type of undefined, but is required at runtime
    id: z.number().optional().refine(Boolean, "Required"),
  }),
)

export default resolver.pipe(
  resolver.zod(GetProtocol),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ id }) => {
    const protocol = await db.protocol.findFirst({
      where: { id },
      include: { protocolTopics: true, subsection: true },
    })

    if (!protocol) throw new NotFoundError()

    return protocol
  },
)
