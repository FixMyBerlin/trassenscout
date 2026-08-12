import { queryOptions } from "@tanstack/react-query"
import { getEvaluationsPageAdminFn, getEvaluationsPageFn } from "./evaluationsPage.functions"

export function evaluationsPageQueryOptions({ projectSlug }: { projectSlug: string }) {
  return queryOptions({
    queryKey: ["evaluationsPage", projectSlug],
    queryFn: () => getEvaluationsPageFn({ data: { projectSlug } }),
  })
}

export function evaluationsPageAdminQueryOptions({ projectSlug }: { projectSlug: string }) {
  return queryOptions({
    queryKey: ["evaluationsPage", "admin", projectSlug],
    queryFn: () => getEvaluationsPageAdminFn({ data: { projectSlug } }),
  })
}
