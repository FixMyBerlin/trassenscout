import { queryOptions } from "@tanstack/react-query"
import { getSubsectionsFn } from "./subsections.functions"
import type { GetSubsectionsInput } from "./subsections.inputSchemas"

export function subsectionsQueryOptions(input: GetSubsectionsInput) {
  return queryOptions({
    queryKey: ["subsections", input],
    queryFn: () => getSubsectionsFn({ data: input }),
  })
}
