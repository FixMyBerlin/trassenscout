import { queryOptions } from "@tanstack/react-query"
import { getSubsubsectionsFn } from "./subsubsections.functions"
import type { GetSubsubsectionsInput } from "./subsubsections.inputSchemas"

export function subsubsectionsQueryOptions(input: GetSubsubsectionsInput) {
  return queryOptions({
    queryKey: ["subsubsections", input],
    queryFn: () => getSubsubsectionsFn({ data: input }),
  })
}
