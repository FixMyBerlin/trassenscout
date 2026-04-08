import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { validateDealAreaInput } from "../_utils/validateDealAreaInput"
import { DealAreaSchema } from "../schema"
import { typeDealAreaGeometry } from "../utils/typeDealAreaGeometry"

const CreateDealAreaSchema = ProjectSlugRequiredSchema.merge(DealAreaSchema)

export default resolver.pipe(
  resolver.zod(CreateDealAreaSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
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

    return typeDealAreaGeometry(dealArea)
  },
)
