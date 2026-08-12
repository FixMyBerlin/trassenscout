import { queryOptions } from "@tanstack/react-query"
import { getSubsubsectionExtraFieldsProjectsFn } from "./subsubsectionExtraFields.functions"

export function subsubsectionExtraFieldsProjectsQueryOptions() {
  return queryOptions({
    queryKey: ["subsubsectionExtraFields", "projects"],
    queryFn: () => getSubsubsectionExtraFieldsProjectsFn(),
  })
}
