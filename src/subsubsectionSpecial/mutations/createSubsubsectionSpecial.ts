import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { OperatorSchema } from "src/operators/schema"
import { SubsubsectionSpecial } from "../schema"

const CreateSubsubsectionSpecialSchema = SubsubsectionSpecial.omit({ projectId: true }).merge(
  z.object({
    projectSlug: z.string(),
  }),
)

export default resolver.pipe(
  resolver.zod(CreateSubsubsectionSpecialSchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, ...input }) =>
    await db.subsubsectionSpecial.create({
      data: {
        ...input,
        projectId: await getProjectIdBySlug(projectSlug),
      },
    }),
)
