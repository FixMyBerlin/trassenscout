import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useContactsModal } from "@/src/components/contacts/ContactsModalHost"
import { ContactTable } from "@/src/components/contacts/ContactTable"
import { useContactFilters } from "@/src/components/contacts/useContactFilters"
import { useContactsTabs } from "@/src/components/contacts/useContactsTabs"
import { useFilteredContacts } from "@/src/components/contacts/useFilteredContacts"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import {
  optionalPageContentPaddingClassName,
  pageContentPaddingClassName,
} from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { PageHeaderSearchFilter } from "@/src/components/core/components/PageHeader/PageHeaderSearchFilter"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { FilteredZeroCase } from "@/src/components/core/components/text/FilteredZeroCase"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { TagFilterCombobox } from "@/src/components/tags/TagFilterCombobox"
import { useTagFilterOptions } from "@/src/components/tags/useTagFilterOptions"
import { contactsQueryOptions } from "@/src/server/contacts/contactsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/contacts/")

export function PageContacts() {
  const { projectSlug } = routeApi.useParams()
  const canEdit = useUserCan().edit
  const tabs = useContactsTabs()
  const contactsModal = useContactsModal()
  const { data } = useSuspenseQuery(contactsQueryOptions({ projectSlug }))
  const { data: currentUser } = useSuspenseQuery(currentUserQueryOptions())
  const contacts = data.contacts
  const filteredContacts = useFilteredContacts(contacts)
  const { filter, setFilter } = useContactFilters()
  const tagOptions = useTagFilterOptions(contacts, projectSlug)
  const resetFilter = () => void setFilter(undefined)

  return (
    <>
      <PageHeader
        title="Weitere Kontakte"
        titleVisuallyHidden
        breadcrumb={<ProjectPageBreadcrumb section="Kontakte" />}
        info="Weitere relevante Ansprechpersonen verwalten, filtern und direkt per Sammel-E-Mail kontaktieren."
        tabs={<TabsApp tabs={tabs} embedded />}
        filters={
          <PageHeaderSearchFilter
            value={filter?.searchterm ?? ""}
            onChange={(searchterm) => void setFilter({ searchterm })}
            onReset={resetFilter}
            hasFilter={Boolean(filter?.searchterm || filter?.tag)}
            placeholder="Namen, E-Mail, Telefonnummern und Positionen durchsuchen"
          >
            <TagFilterCombobox
              tags={tagOptions}
              value={filter?.tag}
              onChange={(tag) => void setFilter({ tag })}
            />
          </PageHeaderSearchFilter>
        }
        primaryAction={
          canEdit ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link button="blue" buttonSize="sm" icon="plus" to={`/${projectSlug}/contacts/table`}>
                Kontakte hinzufügen & bearbeiten
              </Link>
              <Link
                button="blue"
                buttonSize="sm"
                icon="plus"
                to={contactsModal.getContactNewHref()}
                resetScroll={false}
              >
                Neuer Kontakt
              </Link>
            </div>
          ) : undefined
        }
      />
      {contacts.length === 0 ? (
        <div className={pageContentPaddingClassName}>
          <ZeroCase visible={contacts.length} name="Kontakte" />
        </div>
      ) : filteredContacts.length === 0 ? (
        <FilteredZeroCase name="Kontakte" onReset={resetFilter} />
      ) : (
        <ContactTable
          contacts={filteredContacts}
          currentUserEmail={currentUser?.email}
          onTagClick={(tag) => void setFilter({ tag })}
          projectSlug={projectSlug}
        />
      )}
      <div className={optionalPageContentPaddingClassName}>
        <SuperAdminLogData data={contacts} />
      </div>
    </>
  )
}
