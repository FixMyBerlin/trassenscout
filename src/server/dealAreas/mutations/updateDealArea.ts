import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { validateDealAreaInput } from "../_utils/validateDealAreaInput"
import { DealAreaSchema } from "../schema"
import { typeDealAreaGeometry } from "../utils/typeDealAreaGeometry"

const UpdateDealAreaSchema = ProjectSlugRequiredSchema.merge(
  DealAreaSchema.merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateDealAreaSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }) => {
    await db.dealArea.findFirstOrThrow({
      where: {
        id,
        subsubsection: {
          subsection: {
            project: {
              slug: projectSlug,
            },
          },
        },
      },
      select: { id: true },
    })

    await validateDealAreaInput({
      projectSlug,
      subsubsectionId: data.subsubsectionId,
      parcelId: data.parcelId,
      dealAreaStatusId: data.dealAreaStatusId,
    })

    const dealArea = await db.dealArea.update({
      where: { id },
      data: {
        ...data,
        dealAreaStatusId: data.dealAreaStatusId ?? null,
      },
    })

    return typeDealAreaGeometry(dealArea)
  },
)
