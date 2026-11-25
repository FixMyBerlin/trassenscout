import { z } from "zod"
import { jsonSearchParam } from "@/src/shared/routing/jsonSearchParam"
import { tableSortSearchSchema } from "@/src/shared/tableSort/tableSort"
import { searchtermTagFilterSchema } from "@/src/shared/tags/tagFilter"

export const CONTACT_TABLE_SORT_COLUMNS = ["name"] as const

export type ContactTableSortColumn = (typeof CONTACT_TABLE_SORT_COLUMNS)[number]

export const TEAM_TABLE_SORT_COLUMNS = ["name", "role"] as const

export type TeamTableSortColumn = (typeof TEAM_TABLE_SORT_COLUMNS)[number]

export const contactsTeamSearchSchema = z.object({
  sort: tableSortSearchSchema(TEAM_TABLE_SORT_COLUMNS),
})

const contactFilterSchema = searchtermTagFilterSchema

export type ContactFilter = z.infer<typeof contactFilterSchema>

function parseContactFilterParam(value: string | undefined) {
  if (!value) return undefined
  try {
    return contactFilterSchema.parse(JSON.parse(value))
  } catch {
    return undefined
  }
}

export const contactsSearchSchema = z.object({
  filter: jsonSearchParam(contactFilterSchema, parseContactFilterParam),
  sort: tableSortSearchSchema(CONTACT_TABLE_SORT_COLUMNS),
})

export type ContactsSearch = z.infer<typeof contactsSearchSchema>

export const contactModalViewSchema = z.enum(["detail", "edit", "new"])

export const contactModalSearchSchema = z
  .object({
    modalContactId: z.coerce.number().int().positive().optional(),
    modalContactView: contactModalViewSchema.optional(),
  })
  .transform((search) => {
    if (search.modalContactView === "new") {
      return {
        modalContactId: undefined,
        modalContactView: "new" as const,
      }
    }

    if (search.modalContactId && search.modalContactView) {
      return search
    }

    return {
      modalContactId: undefined,
      modalContactView: undefined,
    }
  })

export function clearContactModalSearch<TSearch extends Record<string, unknown>>(search: TSearch) {
  return {
    ...search,
    modalContactId: undefined,
    modalContactView: undefined,
  }
}
