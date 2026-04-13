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
import { validateDealAreaInput } from "../_utils/validateDealAreaInput"
import { DealAreaSchema } from "../schema"
import { typeDealAreaGeometry } from "../utils/typeDealAreaGeometry"

const CreateDealAreaSchema = ProjectSlugRequiredSchema.merge(DealAreaSchema)

export default resolver.pipe(
  resolver.zod(CreateDealAreaSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }, ctx: Ctx) => {
    await validateDealAreaInput({
      projectSlug,
      subsubsectionId: input.subsubsectionId,
      parcelId: input.parcelId,
      dealAreaStatusId: input.dealAreaStatusId,
    })

    const dealArea = await db.dealArea.create({
      data: {
        ...input,
        dealAreaStatusId: input.dealAreaStatusId ?? null,
      },
    })

    await createLogEntry({
      action: "CREATE",
      message: `Erwerbsfläche ${dealArea.id} erstellt`,
      userId: ctx.session.userId,
      projectSlug,
    })

    return typeDealAreaGeometry(dealArea)
  },
)
