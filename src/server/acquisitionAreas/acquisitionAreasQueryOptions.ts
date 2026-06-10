import { queryOptions } from "@tanstack/react-query"
import { getAcquisitionAreasFn } from "./acquisitionAreas.functions"
import type { GetAcquisitionAreasInput } from "./acquisitionAreas.inputSchemas"

export function acquisitionAreasQueryOptions(input: GetAcquisitionAreasInput) {
  return queryOptions({
    queryKey: ["acquisitionAreas", input],
    queryFn: () => getAcquisitionAreasFn({ data: input }),
  })
}
