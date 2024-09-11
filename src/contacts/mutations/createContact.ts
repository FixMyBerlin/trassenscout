import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { ContactSchema } from "../schema"

const CreateContactSchema = ContactSchema.merge(
  z.object({
    projectSlug: z.string(),
  }),
)

export default resolver.pipe(
  resolver.zod(CreateContactSchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, ...input }) =>
    await db.contact.create({
      data: {
        projectId: (await getProjectIdBySlug(projectSlug))!,
        ...input,
      },
    }),
)
