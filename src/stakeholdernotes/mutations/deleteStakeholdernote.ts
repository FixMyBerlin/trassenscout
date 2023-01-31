import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteStakeholdernote = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteStakeholdernote),
  resolver.authorize(),
  async ({ id }) => {
    const stakeholdernote = await db.stakeholdernote.deleteMany({
      where: { id },
    })

    return stakeholdernote
  }
)
