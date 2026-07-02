import { queryOptions } from "@tanstack/react-query"
import { getEvaluationsPageFn } from "./evaluationsPage.functions"

export function evaluationsPageQueryOptions() {
  return queryOptions({
    queryKey: ["evaluationsPage"],
    queryFn: () => getEvaluationsPageFn(),
  })
}
