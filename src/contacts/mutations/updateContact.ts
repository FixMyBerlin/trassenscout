import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import getContactProjectId from "../queries/getContactProjectId"
import { ContactSchema } from "../schema"
import { authorizeProjectAdmin } from "src/authorization"
import db from "db"

const UpdateContactSchema = ContactSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateContactSchema),
  authorizeProjectAdmin(getContactProjectId),
  async ({ id, ...data }) =>
    await db.contact.update({
      where: { id },
      data,
    }),
)
