import { queryOptions } from "@tanstack/react-query"
import { getOperatorMaxOrderFn } from "./operators.functions"

export function operatorMaxOrderQueryOptions(projectSlug: string) {
  return queryOptions({
    queryKey: ["operatorMaxOrder", projectSlug],
    queryFn: () => getOperatorMaxOrderFn({ data: { projectSlug } }),
  })
}
