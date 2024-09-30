import { TeamTable } from "@/src/contacts/components/TeamTable"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import { Tabs } from "@/src/core/components/Tabs/Tabs"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { useProjectSlug } from "@/src/core/hooks"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { IfUserCanEdit } from "@/src/memberships/components/IfUserCan"
import { useUserCan } from "@/src/memberships/hooks/useUserCan"
import { BlitzPage, Routes } from "@blitzjs/next"
import { Suspense } from "react"

export const TeamWithQuery = () => {
  const projectSlug = useProjectSlug()
  const showInvitesTab = useUserCan().edit
  const tabs = [
    { name: "Externe Kontakte", href: Routes.ContactsPage({ projectSlug: projectSlug! }) },
    { name: "Projektteam", href: Routes.ProjectTeamPage({ projectSlug: projectSlug! }) },
    showInvitesTab
      ? { name: "Einladungen", href: Routes.ProjectTeamInvitesPage({ projectSlug: projectSlug! }) }
      : undefined,
  ].filter(Boolean)

  return (
    <>
      <Tabs className="mt-7" tabs={tabs} />

      <TeamTable />

      <IfUserCanEdit>
        <ButtonWrapper className="mt-6 justify-end">
          <Link
            button="blue"
            icon="plus"
            href={Routes.NewProjectTeamInvitePage({ projectSlug: projectSlug! })}
          >
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
        description="Kontakt zu allen registrierten Mitglieder:innen des Projektes."
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
