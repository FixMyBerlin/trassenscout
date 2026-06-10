import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import type { GetOperatorsPaginatedSchema } from "@/src/shared/operators/searchSchemas"
import { getOperatorsPaginatedFn } from "./operators.functions"

export function operatorsPaginatedQueryOptions(input: z.infer<typeof GetOperatorsPaginatedSchema>) {
  return queryOptions({
    queryKey: ["operatorsPaginated", input],
    queryFn: () => getOperatorsPaginatedFn({ data: input }),
  })
}
