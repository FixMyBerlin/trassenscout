import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import { Tabs } from "@/src/core/components/Tabs/Tabs"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { IfUserCanEdit } from "@/src/memberships/components/IfUserCan"
import { useUserCan } from "@/src/memberships/hooks/useUserCan"
import { TeamTable } from "@/src/pagesComponents/contacts/TeamTable"
import { BlitzPage, Routes } from "@blitzjs/next"
import { Suspense } from "react"

export const TeamWithQuery = () => {
  const projectSlug = useProjectSlug()
  const showInvitesTab = useUserCan().edit
  const tabs = [
    { name: "Externe Kontakte", href: Routes.ContactsPage({ projectSlug }) },
    { name: "Projektteam", href: Routes.ProjectTeamPage({ projectSlug }) },
    showInvitesTab
      ? { name: "Einladungen", href: Routes.ProjectTeamInvitesPage({ projectSlug }) }
      : undefined,
  ].filter(Boolean)

  return (
    <>
      <Tabs className="mt-7" tabs={tabs} />

      <TeamTable />

      <IfUserCanEdit>
        <ButtonWrapper className="mt-6">
          <Link button="blue" icon="plus" href={Routes.NewProjectTeamInvitePage({ projectSlug })}>
            Mitwirkende einladen
          </Link>
        </ButtonWrapper>
      </IfUserCanEdit>

      <SuperAdminBox>
        <Link button="blue" href={Routes.AdminMembershipsPage()}>
          Rechte verwalten
        </Link>
      </SuperAdminBox>
    </>
  )
}

const ProjectTeamPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Projektteam" />
      <PageHeader
        title="Projektteam"
        description="Kontakt zu allen registrierten Mitgliedern des Projektes."
        className="mt-12"
      />

      <Suspense fallback={<Spinner page />}>
        <TeamWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

ProjectTeamPage.authenticate = true

export default ProjectTeamPage
