import type { getEvaluationsPages } from "./evaluationsPage.server"

export type EvaluationsPagesList = Awaited<ReturnType<typeof getEvaluationsPages>>
