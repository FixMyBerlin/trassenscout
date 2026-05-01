import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { EmailTemplateByKeySchema } from "../schema"

export default resolver.pipe(
  resolver.zod(EmailTemplateByKeySchema),
  resolver.authorize("ADMIN"),
  async ({ key }) => {
    await db.emailTemplate.deleteMany({
      where: { key },
    })

    return { key }
  },
)
