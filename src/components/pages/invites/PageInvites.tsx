import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useContactsModal } from "@/src/components/contacts/ContactsModalHost"
import { useContactsTabs } from "@/src/components/contacts/useContactsTabs"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { TeamInviteDocumentation } from "@/src/components/invites/TeamInviteDocumentation"
import { TeamInvitesTable } from "@/src/components/invites/TeamInvitesTable"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { invitesQueryOptions } from "@/src/server/invites/invitesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/invites/")

export function PageInvites() {
  const { projectSlug } = routeApi.useParams()
  const tabs = useContactsTabs()
  const contactsModal = useContactsModal()
  const { data } = useSuspenseQuery(invitesQueryOptions({ projectSlug }))

  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Einladungen" />}
        info="Übersicht der Einladungen zur Mitarbeit im Projekt."
        tabs={<TabsApp tabs={tabs} embedded />}
        title="Einladungen"
      />
      <TeamInvitesTable invites={data.invites} />
      <IfUserCanEdit>
        <ButtonWrapper className="mt-6">
          <Link button="blue" icon="plus" to={contactsModal.getInviteNewHref()} resetScroll={false}>
            Teammitglied einladen
          </Link>
        </ButtonWrapper>
      </IfUserCanEdit>
      <TeamInviteDocumentation />
      <SuperAdminBox>
        <Link button="blue" to="/admin/memberships">
          Rechte verwalten
        </Link>
      </SuperAdminBox>
    </>
  )
}
