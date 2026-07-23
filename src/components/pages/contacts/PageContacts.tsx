import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useContactsModal } from "@/src/components/contacts/ContactsModalHost"
import { ContactTable } from "@/src/components/contacts/ContactTable"
import { useContactsTabs } from "@/src/components/contacts/useContactsTabs"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
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

  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Kontakte" />}
        info="Kontaktdaten, die für das ganze Projektteam wichtig sind."
        tabs={<TabsApp tabs={tabs} embedded />}
        primaryAction={
          canEdit ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link button="blue" icon="plus" to={`/${projectSlug}/contacts/table`}>
                Kontakte hinzufügen & bearbeiten
              </Link>
              <Link
                button="blue"
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
      ) : (
        <ContactTable
          contacts={contacts}
          currentUserEmail={currentUser?.email}
          projectSlug={projectSlug}
        />
      )}
      <div className={pageContentPaddingClassName}>
        <SuperAdminLogData data={contacts} />
      </div>
    </>
  )
}
