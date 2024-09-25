import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import { Tabs } from "@/src/core/components/Tabs/Tabs"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoIndexTitle } from "@/src/core/components/text"
import { useSlugs } from "@/src/core/hooks"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { TeamInviteDocumentation } from "@/src/invites/components/TeamInviteDocumentation"
import { TeamInvitesTable } from "@/src/invites/components/TeamInvitesTable"
import { BlitzPage, Routes } from "@blitzjs/next"
import { Suspense } from "react"

export const TeamInvitesWithQuery = () => {
  const { projectSlug } = useSlugs()

  const tabs = [
    { name: "Externe Kontakte", href: Routes.ContactsPage({ projectSlug: projectSlug! }) },
    { name: "Projektteam", href: Routes.ProjectTeamPage({ projectSlug: projectSlug! }) },
    { name: "Einladungen", href: Routes.ProjectTeamInvitesPage({ projectSlug: projectSlug! }) },
  ]

  return (
    <>
      <Tabs className="mt-7" tabs={tabs} />

      <TeamInvitesTable />

      <ButtonWrapper className="mt-6">
        <Link
          button="blue"
          icon="plus"
          href={Routes.NewProjectTeamInvitePage({ projectSlug: projectSlug! })}
        >
          Mitwirkende einladen
        </Link>
      </ButtonWrapper>

      <TeamInviteDocumentation />

      <SuperAdminBox>
        <Link button="blue" href={Routes.AdminMembershipsPage()}>
          Rechte verwalten
        </Link>
      </SuperAdminBox>
    </>
  )
}

const ProjectTeamInvitesPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoIndexTitle("Einladungen")} />
      <PageHeader
        title="Einladungen"
        description="Übersicht der Einladungen zur Mitarbeit im Projekt."
        className="mt-12"
      />

      <Suspense fallback={<Spinner page />}>
        <TeamInvitesWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

ProjectTeamInvitesPage.authenticate = true

export default ProjectTeamInvitesPage
