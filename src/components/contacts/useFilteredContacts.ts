import { getFullname } from "@/src/components/core/users/getFullname"
import { normalizeSearchterm } from "@/src/components/core/utils/normalizeSearchterm"
import { matchesTagFilter } from "@/src/components/tags/tagFilterOptions"
import type { Contact } from "@/src/server/contacts/types"
import { useContactFilters } from "./useContactFilters"

export const useFilteredContacts = (contacts: Contact[]) => {
  const { filter } = useContactFilters()
  const cleanedSearchterm = normalizeSearchterm(filter?.searchterm ?? "")
  const tag = filter?.tag

  if (!cleanedSearchterm && !tag) return contacts

  return contacts.filter((contact) => {
    if (!matchesTagFilter(contact, tag)) return false
    if (!cleanedSearchterm) return true

    const fullname = getFullname(contact)?.trim().toLowerCase() ?? ""

    return (
      fullname.includes(cleanedSearchterm) ||
      contact.firstName?.toLowerCase().includes(cleanedSearchterm) ||
      contact.lastName?.toLowerCase().includes(cleanedSearchterm) ||
      contact.email?.toLowerCase().includes(cleanedSearchterm) ||
      contact.phone?.toLowerCase().includes(cleanedSearchterm) ||
      contact.role?.toLowerCase().includes(cleanedSearchterm) ||
      contact.note?.toLowerCase().includes(cleanedSearchterm)
    )
  })
}
