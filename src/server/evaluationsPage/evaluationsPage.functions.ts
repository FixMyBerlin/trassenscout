import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  EvaluationsPageByProjectSlugSchema,
  UpsertEvaluationsPageSchema,
} from "./evaluationsPage.inputSchemas"
import {
  getEvaluationsPage,
  getEvaluationsPageAdmin,
  upsertEvaluationsPage,
} from "./evaluationsPage.server"

export const getEvaluationsPageFn = createServerFn({ method: "GET" })
  .validator(EvaluationsPageByProjectSlugSchema)
  .handler(({ data }) => getEvaluationsPage(getRequestHeaders(), data))

export const getEvaluationsPageAdminFn = createServerFn({ method: "GET" })
  .validator(EvaluationsPageByProjectSlugSchema)
  .handler(({ data }) => getEvaluationsPageAdmin(getRequestHeaders(), data))

export const upsertEvaluationsPageFn = createServerFn({ method: "POST" })
  .validator(UpsertEvaluationsPageSchema)
  .handler(({ data }) => upsertEvaluationsPage(getRequestHeaders(), data))
