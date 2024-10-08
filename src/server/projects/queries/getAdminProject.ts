import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"

export const GetProject = z.object({ id: z.number() })

export default resolver.pipe(
  resolver.zod(GetProject),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const project = await db.project.findFirst({
      where: { id },
    })
    if (!project) throw new NotFoundError()
    return project
  },
)
