import { getFullname } from "@/src/components/core/users/getFullname"
import type { Contact } from "@/src/server/contacts/types"
import { useContactFilters } from "./useContactFilters"

const normalizeSearchterm = (searchterm: string) =>
  searchterm.trim().toLowerCase().replace(/#/g, "").trim()

export const useFilteredContacts = (contacts: Contact[]) => {
  const { filter } = useContactFilters()

  if (!filter?.searchterm) return contacts

  const cleanedSearchterm = normalizeSearchterm(filter.searchterm)
  if (!cleanedSearchterm) return contacts

  return contacts.filter((contact) => {
    const fullname = getFullname(contact)?.trim().toLowerCase() ?? ""

    return (
      fullname.includes(cleanedSearchterm) ||
      contact.firstName?.toLowerCase().includes(cleanedSearchterm) ||
      contact.lastName.toLowerCase().includes(cleanedSearchterm) ||
      contact.email.toLowerCase().includes(cleanedSearchterm) ||
      contact.phone?.toLowerCase().includes(cleanedSearchterm) ||
      contact.role?.toLowerCase().includes(cleanedSearchterm) ||
      contact.note?.toLowerCase().includes(cleanedSearchterm) ||
      contact.tags.some((tag) => tag.title.toLowerCase().includes(cleanedSearchterm))
    )
  })
}
