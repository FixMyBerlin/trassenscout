import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import { Tabs } from "@/src/core/components/Tabs/Tabs"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoIndexTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { TeamInviteDocumentation } from "@/src/pagesComponents/invites/TeamInviteDocumentation"
import { TeamInvitesTable } from "@/src/pagesComponents/invites/TeamInvitesTable"
import { BlitzPage, Routes } from "@blitzjs/next"
import { Suspense } from "react"

export const TeamInvitesWithQuery = () => {
  const projectSlug = useProjectSlug()

  const tabs = [
    { name: "Externe Kontakte", href: Routes.ContactsPage({ projectSlug }) },
    { name: "Projektteam", href: Routes.ProjectTeamPage({ projectSlug }) },
    { name: "Einladungen", href: Routes.ProjectTeamInvitesPage({ projectSlug }) },
  ]

  return (
    <>
      <Tabs className="mt-7" tabs={tabs} />

      <TeamInvitesTable />

      <ButtonWrapper className="mt-6">
        <Link button="blue" icon="plus" href={Routes.NewProjectTeamInvitePage({ projectSlug })}>
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
