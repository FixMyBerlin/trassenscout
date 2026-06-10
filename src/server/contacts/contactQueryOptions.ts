import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import type { GetContactSchema } from "@/src/shared/contacts/schemas"
import { getContactFn } from "./contacts.functions"

export function contactQueryOptions(input: z.infer<typeof GetContactSchema>) {
  return queryOptions({
    queryKey: ["contact", input],
    queryFn: () => getContactFn({ data: input }),
  })
}
