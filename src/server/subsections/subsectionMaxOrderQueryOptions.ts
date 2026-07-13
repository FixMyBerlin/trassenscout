import { queryOptions } from "@tanstack/react-query"
import { getSubsectionMaxOrderFn } from "./subsections.functions"

export function subsectionMaxOrderQueryOptions(projectSlug: string) {
  return queryOptions({
    queryKey: ["subsectionMaxOrder", projectSlug],
    queryFn: () => getSubsectionMaxOrderFn({ data: { projectSlug } }),
  })
}
