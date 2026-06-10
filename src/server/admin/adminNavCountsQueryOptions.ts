import { queryOptions } from "@tanstack/react-query"
import { getAdminNavCountsFn } from "./adminNavCounts.functions"

export function adminNavCountsQueryOptions() {
  return queryOptions({
    queryKey: ["adminNavCounts"],
    queryFn: () => getAdminNavCountsFn(),
  })
}
