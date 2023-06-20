import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getOperatorProjectId from "../queries/getOperatorProjectId"
import { OperatorSchema } from "../schema"

const UpdateOperatorSchema = OperatorSchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateOperatorSchema),
  authorizeProjectAdmin(getOperatorProjectId),
  async ({ id, ...data }) =>
    await db.operator.update({
      where: { id },
      data,
    })
)
