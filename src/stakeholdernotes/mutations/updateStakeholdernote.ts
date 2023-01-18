import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateStakeholdernote = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateStakeholdernote),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const stakeholdernote = await db.stakeholdernote.update({
      where: { id },
      data,
    })

    return stakeholdernote
  }
)
