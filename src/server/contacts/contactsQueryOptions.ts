import { queryOptions } from "@tanstack/react-query"
import type { GetContactsInput } from "@/src/shared/contacts/schemas"
import { getContactsFn } from "./contacts.functions"

export function contactsQueryOptions(input: GetContactsInput) {
  return queryOptions({
    queryKey: ["contacts", input],
    queryFn: () => getContactsFn({ data: input }),
  })
}
