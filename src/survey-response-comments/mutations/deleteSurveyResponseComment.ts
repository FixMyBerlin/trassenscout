import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { AuthorizationError } from "blitz"
import { z } from "zod"

const Schema = ProjectSlugRequiredSchema.merge(z.object({ commentId: z.number() }))

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

    if (dbUserId !== session.userId) {
      throw new AuthorizationError()
    }

    const result = await db.surveyResponseComment.deleteMany({
      where: { id: commentId },
    })
    return result
  },
)
