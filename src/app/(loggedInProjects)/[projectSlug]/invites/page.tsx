import { invoke } from "@/src/blitz-server"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { TabsApp } from "@/src/core/components/Tabs/TabsApp"
import { seoIndexTitle } from "@/src/core/components/text"
import getInvites from "@/src/server/invites/queries/getInvites"
import { Metadata, Route } from "next"
import "server-only"
import { getContactsTabs } from "../contacts/_utils/contactsTabs"
import { TeamInviteDocumentation } from "./_components/TeamInviteDocumentation"
import { TeamInvitesTable } from "./_components/TeamInvitesTable"

export const metadata: Metadata = {
  title: seoIndexTitle("Einladungen"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function ProjectTeamInvitesPage({ params: { projectSlug } }: Props) {
  const { invites } = await invoke(getInvites, { projectSlug })
  const tabs = await getContactsTabs(projectSlug)

  return (
    <>
      <PageHeader
        title="Einladungen"
        description="Übersicht der Einladungen zur Mitarbeit im Projekt."
        className="mt-12"
      />
      <TabsApp tabs={tabs} className="mt-7" />

      <TeamInvitesTable invites={invites} />

      <ButtonWrapper className="mt-6">
        <Link button="blue" icon="plus" href={`/${projectSlug}/invites/new` as Route}>
          Teammitglied einladen
        </Link>
      </ButtonWrapper>

      <TeamInviteDocumentation />

      <SuperAdminBox>
        <Link button="blue" href={`/admin/memberships`}>
          Rechte verwalten
        </Link>
      </SuperAdminBox>
    </>
  )
}
