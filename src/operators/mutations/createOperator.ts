import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { OperatorSchema } from "../schema"

const CreateOperatorSchema = OperatorSchema.omit({ projectId: true }).merge(
  z.object({
    projectSlug: z.string(),
  }),
)

export default resolver.pipe(
  resolver.zod(CreateOperatorSchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, ...input }) =>
    await db.operator.create({
      data: {
        ...input,
        projectId: await getProjectIdBySlug(projectSlug),
      },
    }),
)
