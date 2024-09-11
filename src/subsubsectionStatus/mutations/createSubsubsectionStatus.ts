import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { SubsubsectionStatus } from "../schema"

const CreateSubsubsectionStatusSchema = SubsubsectionStatus.omit({ projectId: true }).merge(
  z.object({
    projectSlug: z.string(),
  }),
)

export default resolver.pipe(
  resolver.zod(CreateSubsubsectionStatusSchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, ...input }) =>
    await db.subsubsectionStatus.create({
      data: {
        ...input,
        projectId: await getProjectIdBySlug(projectSlug),
      },
    }),
)
