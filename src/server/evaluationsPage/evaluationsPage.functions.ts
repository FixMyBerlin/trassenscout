import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { UpsertEvaluationsPageSchema } from "./evaluationsPage.inputSchemas"
import { getEvaluationsPage, upsertEvaluationsPage } from "./evaluationsPage.server"

export const getEvaluationsPageFn = createServerFn({ method: "GET" }).handler(() =>
  getEvaluationsPage(getRequestHeaders()),
)

export const upsertEvaluationsPageFn = createServerFn({ method: "POST" })
  .validator(UpsertEvaluationsPageSchema)
  .handler(({ data }) => upsertEvaluationsPage(getRequestHeaders(), data))
