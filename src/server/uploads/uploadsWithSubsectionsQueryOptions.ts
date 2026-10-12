import { queryOptions } from "@tanstack/react-query"
import { getUploadsWithSubsectionsFn } from "./uploads.functions"

export function uploadsWithSubsectionsQueryOptions(input: {
  projectSlug: string
  subsubsectionId?: number
  acquisitionAreaId?: number
  uploadIds?: number[]
}) {
  return queryOptions({
    queryKey: ["uploadsWithSubsections", input],
    queryFn: () => getUploadsWithSubsectionsFn({ data: input }),
  })
}
