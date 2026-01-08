import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { TabsApp } from "@/src/core/components/Tabs/TabsApp"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import { Metadata, Route } from "next"
import "server-only"
import { getContactsTabs } from "../_utils/contactsTabs"
import { TeamTable } from "./_components/TeamTable"

export const metadata: Metadata = {
  title: "Projektteam",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function ProjectTeamPage({ params: { projectSlug } }: Props) {
  const users = await invoke(getProjectUsers, { projectSlug })
  const tabs = await getContactsTabs(projectSlug)

  return (
    <>
      <PageHeader
        title="Projektteam"
        description="Kontakt zu allen registrierten Mitgliedern des Projektes."
        className="mt-12"
      />
      <TabsApp tabs={tabs} className="mt-7" />

      <TeamTable users={users} projectSlug={projectSlug} />

      <IfUserCanEdit>
        <ButtonWrapper className="mt-6">
          <Link button="blue" icon="plus" href={`/${projectSlug}/invites/new` as Route}>
            Teammitglied einladen
          </Link>
        </ButtonWrapper>
      </IfUserCanEdit>

      <SuperAdminBox>
        <Link button="blue" href={`/admin/memberships`}>
          Rechte verwalten
        </Link>
      </SuperAdminBox>
    </>
  )
}
