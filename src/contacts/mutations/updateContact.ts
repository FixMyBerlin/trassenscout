import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getContactProjectId from "../queries/getContactProjectId"
import { ContactSchema } from "../schema"

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
