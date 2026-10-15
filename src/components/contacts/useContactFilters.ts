import { getRouteApi } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import type { ContactFilter, ContactsSearch } from "@/src/shared/contacts/searchSchemas"
import { mergeSearchtermTagFilter } from "@/src/shared/tags/tagFilter"

const contactsRouteApi = getRouteApi("/_loggedInProjects/$projectSlug/contacts/")

export function useContactFilters() {
  const search = contactsRouteApi.useSearch()
  const navigate = contactsRouteApi.useNavigate()
  const filter = search.filter

  /** Merges into the current filter; `undefined` resets it. */
  const setFilter = async (patch: Partial<ContactFilter> | undefined) => {
    await navigate({
      to: ".",
      search: (previous: ContactsSearch) => ({
        ...previous,
        filter: mergeSearchtermTagFilter(previous.filter, patch),
      }),
      ...preserveScrollNavigateOptions,
    })
  }

  return { filter, setFilter }
}
