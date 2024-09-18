import { TeamInvitesTable } from "@/src/contacts/components/TeamInvitesTable"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import { Tabs } from "@/src/core/components/Tabs/Tabs"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { useSlugs } from "@/src/core/hooks"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { BlitzPage, Routes } from "@blitzjs/next"
import { Suspense } from "react"

export const TeamInvitesWithQuery = () => {
  const { projectSlug } = useSlugs()

  return (
    <>
      <Tabs
        className="mt-7"
        tabs={[
          { name: "Externe Kontakte", href: Routes.ContactsPage({ projectSlug: projectSlug! }) },
          { name: "Projektteam", href: Routes.ProjectTeamPage({ projectSlug: projectSlug! }) },
        ]}
      />

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
      <MetaTags noindex title="Einladungen" />
      <PageHeader
        title="Einladungen"
        description="Übersich der Einladungen zur Mitarbeit im Projekt. Abgeschlossene Einladungen werden nach 30 Tagen gelöscht."
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
