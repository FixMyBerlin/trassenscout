import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { UpdateUser } from "../validations"

export default resolver.pipe(
  resolver.zod(UpdateUser),
  resolver.authorize(/* ok */),
  async (data, ctx) => {
    return await db.user.update({ where: { id: ctx.session.userId }, data })
  },
)
