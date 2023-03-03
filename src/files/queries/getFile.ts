import { resolver } from "@blitzjs/rpc"
import db, { File } from "db"
import { z } from "zod"

import createPresignedUrl from "./createPresignedUrl";

const GetFile = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
  presignUrl: z.boolean().default(false),
})

interface FileS3 extends File {
  presignedUrl: string | null
}

export default resolver.pipe(resolver.zod(GetFile), resolver.authorize(), async ({ id, presignUrl }) => {
  const file = await db.file.findFirstOrThrow({ where: { id } }) as FileS3
  const isS3 = (new URL(file.externalUrl)).host.endsWith('amazonaws.com')
  if (isS3 && presignUrl) {
    file.presignedUrl = await createPresignedUrl(file.externalUrl)
  } else {
    file.presignedUrl = null
  }
  return file
})
