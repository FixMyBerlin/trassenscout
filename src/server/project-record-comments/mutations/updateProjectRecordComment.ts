import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthorizationError } from "blitz"

import { z } from "zod"

const Schema = ProjectSlugRequiredSchema.merge(
  z.object({ commentId: z.number(), body: z.string() }),
)

export default resolver.pipe(
  resolver.zod(Schema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ commentId, body, projectSlug }, ctx: Ctx) => {
    // Only author may update own note comment
    const { userId: dbUserId } = await db.projectRecordComment.findFirstOrThrow({
      where: { id: commentId },
      select: { userId: true },
    })

    if (dbUserId !== ctx.session.userId && ctx.session.role !== "ADMIN") {
      throw new AuthorizationError()
    }

    const previous = await db.projectRecordComment.findFirst({ where: { id: commentId } })

    const result = await db.projectRecordComment.update({
      where: { id: commentId },
      data: { body },
    })

    await createLogEntry({
      action: "UPDATE",
      message: `Protokolleintrags-Kommentar geändert`,
      userId: ctx.session.userId,
      projectSlug,
      previousRecord: previous,
      updatedRecord: result,
      projectRecordId: result.projectRecordId,
    })

    return result
  },
)
