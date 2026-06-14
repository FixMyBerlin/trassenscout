import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { EVALUATIONS_PAGE_DEFAULTS } from "../defaults"

export default resolver.pipe(resolver.authorize(), async () => {
  const page = await db.evaluationsPage.findUnique({ where: { id: 1 } })

  if (!page) {
    return EVALUATIONS_PAGE_DEFAULTS
  }

  return {
    title: page.title,
    markdown: page.markdown,
  }
})
