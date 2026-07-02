import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { EVALUATIONS_PAGE_DEFAULTS } from "./defaults"
import { UpsertEvaluationsPageSchema } from "./evaluationsPage.inputSchemas"

export async function getEvaluationsPage(headers: Headers) {
  await endpointAuth.session(headers)

  const page = await db.evaluationsPage.findUnique({ where: { id: 1 } })

  return {
    title: page?.title ?? EVALUATIONS_PAGE_DEFAULTS.title,
    markdown: page?.markdown ?? EVALUATIONS_PAGE_DEFAULTS.markdown,
  }
}

export async function upsertEvaluationsPage(
  headers: Headers,
  input: z.infer<typeof UpsertEvaluationsPageSchema>,
) {
  const session = await endpointAuth.admin(headers)

  return db.evaluationsPage.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      ...input,
      updatedById: Number(session.userId),
    },
    update: {
      ...input,
      updatedById: Number(session.userId),
    },
  })
}
