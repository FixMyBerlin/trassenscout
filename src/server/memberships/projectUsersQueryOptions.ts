import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import { getProjectUsersFn } from "./memberships.functions"
import type { GetProjectUsersSchema } from "./memberships.server"

export function projectUsersQueryOptions(input: z.infer<typeof GetProjectUsersSchema>) {
  return queryOptions({
    queryKey: ["projectUsers", input],
    queryFn: () => getProjectUsersFn({ data: input }),
  })
}
