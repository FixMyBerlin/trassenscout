import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"

const GetFile = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
  projectSlug: z.string(),
})

export default resolver.pipe(resolver.zod(GetFile), authorizeProjectAdmin(), async ({ id }) => {
  const file = await db.file.findFirst({ where: { id } })
  if (!file) throw new NotFoundError()

  return file
})
