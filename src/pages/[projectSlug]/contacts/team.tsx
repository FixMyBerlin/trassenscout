import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { TeamTable } from "src/contacts/components/TeamTable"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "src/core/components/Spinner"
import { Tabs } from "src/core/components/Tabs/Tabs"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getProjectUsers from "src/memberships/queries/getProjectUsers"

export const TeamWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [users] = useQuery(getProjectUsers, { projectSlug: projectSlug! })

  return (
    <>
      <Tabs
        className="mt-7"
        tabs={[
          { name: "Externe Kontakte", href: Routes.ContactsPage({ projectSlug: projectSlug! }) },
          { name: "Projektteam", href: Routes.ProjectTeamPage({ projectSlug: projectSlug! }) },
        ]}
      />

      <TeamTable contacts={users} />

      <SuperAdminBox>
        <Link button="blue" href={Routes.AdminMembershipsPage()}>
          Rechte verwalten
        </Link>
      </SuperAdminBox>

      <SuperAdminLogData data={users} />
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
