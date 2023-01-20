import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { UpdateUser } from "../validations"

const UpdateUpdateUser = UpdateUser.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateUpdateUser),
  resolver.authorize(),
  async ({ id, ...data }) => {
    const user = await db.user.update({ where: { id }, data })

    return user
  }
)
