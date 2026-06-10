import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { TeamTable } from "@/src/components/contacts/team/TeamTable"
import { useContactsTabs } from "@/src/components/contacts/useContactsTabs"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { projectUsersQueryOptions } from "@/src/server/memberships/projectUsersQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/contacts/team/")

export function PageContactsTeam() {
  const { projectSlug } = routeApi.useParams()
  const tabs = useContactsTabs()
  const { data: users } = useSuspenseQuery(projectUsersQueryOptions({ projectSlug }))

  return (
    <>
      <PageHeader
        title="Projektteam"
        description="Kontakt zu allen registrierten Mitgliedern des Projektes."
      />
      <TabsApp tabs={tabs} className="mt-7" />
      <TeamTable users={users} projectSlug={projectSlug} />
      <IfUserCanEdit>
        <ButtonWrapper className="mt-6">
          <Link button="blue" icon="plus" to={`/${projectSlug}/invites/new`}>
            Teammitglied einladen
          </Link>
        </ButtonWrapper>
      </IfUserCanEdit>
      <SuperAdminBox>
        <Link button="blue" to="/admin/memberships">
          Rechte verwalten
        </Link>
      </SuperAdminBox>
    </>
  )
}
