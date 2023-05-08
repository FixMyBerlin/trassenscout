import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { TeamTable } from "src/contacts/components/TeamTable"
import getProjectUsers from "src/users/queries/getProjectUsers"
import getProject from "src/projects/queries/getProject"
import { Tabs } from "src/core/components/Tabs/Tabs"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"

export const TeamWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })
  const [users] = useQuery(getProjectUsers, { projectSlug: projectSlug! })

  return (
    <div className="mt-8 flex flex-col">
      <PageHeader
        title="Das Projektteam"
        description={`Dieser Bereich hilft Ihnen dabei wichtige Informationen und Kontakte der Beteiligten des Projektes ${project.title} zu finden.`}
      />

      <Tabs
        className="mt-7"
        tabs={[
          { name: "Kontakte", href: Routes.ContactsPage({ projectSlug: projectSlug! }) },
          { name: "Projektteam", href: Routes.ProjectTeamPage({ projectSlug: projectSlug! }) },
        ]}
      />

      <TeamTable contacts={users} />

      <SuperAdminLogData data={users} />
    </div>
  )
}

const ProjectTeamPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Projektteam" />

      <Suspense fallback={<Spinner page />}>
        <TeamWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

export default ProjectTeamPage
