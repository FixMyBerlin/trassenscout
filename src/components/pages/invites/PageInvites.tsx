import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useContactsModal } from "@/src/components/contacts/ContactsModalHost"
import { useContactsTabs } from "@/src/components/contacts/useContactsTabs"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { TeamInviteDocumentation } from "@/src/components/invites/TeamInviteDocumentation"
import { TeamInvitesTable } from "@/src/components/invites/TeamInvitesTable"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { invitesQueryOptions } from "@/src/server/invites/invitesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/invites/")

export function PageInvites() {
  const { projectSlug } = routeApi.useParams()
  const canEdit = useUserCan().edit
  const tabs = useContactsTabs()
  const contactsModal = useContactsModal()
  const { data } = useSuspenseQuery(invitesQueryOptions({ projectSlug }))

  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Kontakte" />}
        info="Übersicht der Einladungen zur Mitarbeit im Projekt."
        tabs={<TabsApp tabs={tabs} embedded />}
        primaryAction={
          canEdit ? (
            <Link
              button="blue"
              icon="plus"
              to={contactsModal.getInviteNewHref()}
              resetScroll={false}
            >
              Teammitglied einladen
            </Link>
          ) : undefined
        }
      />
      <TeamInvitesTable invites={data.invites} />
      <TeamInviteDocumentation />
      <SuperAdminBox>
        <Link button="blue" to="/admin/memberships">
          Rechte verwalten
        </Link>
      </SuperAdminBox>
    </>
  )
}
