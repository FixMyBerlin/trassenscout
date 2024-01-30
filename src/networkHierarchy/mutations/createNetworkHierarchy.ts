import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { OperatorSchema } from "src/operators/schema"

const CreateOperatorSchema = OperatorSchema.omit({ projectId: true }).merge(
  z.object({
    projectSlug: z.string(),
  }),
)

export default resolver.pipe(
  resolver.zod(CreateOperatorSchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, ...input }) =>
    await db.networkHierarchy.create({
      data: {
        ...input,
        projectId: await getProjectIdBySlug(projectSlug),
      },
    }),
)
