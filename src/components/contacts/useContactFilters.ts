import { getRouteApi } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import type { ContactFilter, ContactsSearch } from "@/src/shared/contacts/searchSchemas"

const contactsRouteApi = getRouteApi("/_loggedInProjects/$projectSlug/contacts/")

type FilterUpdater =
  | ContactFilter
  | undefined
  | ((previous: ContactFilter | undefined) => ContactFilter | undefined)

export function useContactFilters() {
  const search = contactsRouteApi.useSearch()
  const navigate = contactsRouteApi.useNavigate()
  const filter = search.filter

  const setFilter = async (updater: FilterUpdater) => {
    await navigate({
      to: ".",
      search: (previous: ContactsSearch) => {
        const next = typeof updater === "function" ? updater(previous.filter) : updater
        return {
          ...previous,
          filter: next,
        }
      },
      ...preserveScrollNavigateOptions,
    })
  }

  return { filter, setFilter }
}
