import { queryOptions } from "@tanstack/react-query"
import { getAcquisitionAreaFn } from "./acquisitionAreas.functions"

export function acquisitionAreaQueryOptions(input: { projectSlug: string; id: number }) {
  return queryOptions({
    queryKey: ["acquisitionArea", input],
    queryFn: () => getAcquisitionAreaFn({ data: input }),
  })
}
