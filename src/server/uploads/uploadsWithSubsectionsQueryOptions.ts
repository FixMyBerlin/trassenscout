import { queryOptions } from "@tanstack/react-query"
import type { Prisma } from "@/src/prisma/generated/browser"
import { getUploadsWithSubsectionsFn } from "./uploads.functions"

export function uploadsWithSubsectionsQueryOptions(input: {
  projectSlug: string
  where?: Prisma.UploadWhereInput
}) {
  return queryOptions({
    queryKey: ["uploadsWithSubsections", input],
    queryFn: () => getUploadsWithSubsectionsFn({ data: input }),
  })
}
