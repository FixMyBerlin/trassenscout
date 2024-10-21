import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { UpdateUserSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(UpdateUserSchema),
  resolver.authorize(/* ok, we check the user with `ctx.session.userId` */),
  async (data, ctx) => {
    return await db.user.update({ where: { id: ctx.session.userId }, data })
  },
)
