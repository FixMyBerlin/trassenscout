import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { AuthorizationError } from "blitz"

import { z } from "zod"

const Schema = z.object({ projectSlug: z.string(), commentId: z.number() })

export default resolver.pipe(
  resolver.zod(Schema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ commentId }, ctx) => {
    const { session } = ctx

    // Only author may delete own note comment
    const { userId: dbUserId } = await db.surveyResponseComment.findFirstOrThrow({
      where: { id: commentId },
      select: { userId: true },
    })

    if (!session.userId || dbUserId !== session.userId) {
      throw new AuthorizationError()
    }

    const result = await db.surveyResponseComment.deleteMany({
      where: { id: commentId },
    })
    return result
  },
)
