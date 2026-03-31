import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { DealAreaSchema } from "../schema"
import { typeDealAreaGeometry } from "../utils/typeDealAreaGeometry"

const CreateDealAreaSchema = ProjectSlugRequiredSchema.merge(DealAreaSchema)

export default resolver.pipe(
  resolver.zod(CreateDealAreaSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    await db.subsubsection.findFirstOrThrow({
      where: {
        id: input.subsubsectionId,
        subsection: {
          project: {
            slug: projectSlug,
          },
        },
      },
      select: { id: true },
    })

    const dealArea = await db.dealArea.create({
      data: {
        ...input,
        parcelId: input.parcelId ?? null,
      },
    })

    return typeDealAreaGeometry(dealArea)
  },
)
