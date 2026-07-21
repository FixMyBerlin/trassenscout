import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useContactsModal } from "@/src/components/contacts/ContactsModalHost"
import { TeamTable } from "@/src/components/contacts/team/TeamTable"
import { useContactsTabs } from "@/src/components/contacts/useContactsTabs"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { projectUsersQueryOptions } from "@/src/server/memberships/projectUsersQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/contacts/team/")

export function PageContactsTeam() {
  const { projectSlug } = routeApi.useParams()
  const canEdit = useUserCan().edit
  const tabs = useContactsTabs()
  const contactsModal = useContactsModal()
  const { data: users } = useSuspenseQuery(projectUsersQueryOptions({ projectSlug }))

  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Projektteam" />}
        info="Kontakt zu allen registrierten Mitgliedern des Projektes."
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
      <TeamTable users={users} projectSlug={projectSlug} />
      <SuperAdminBox>
        <Link button="blue" to="/admin/memberships">
          Rechte verwalten
        </Link>
      </SuperAdminBox>
    </>
  )
}
