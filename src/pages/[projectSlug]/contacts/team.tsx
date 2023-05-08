import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { ContactListTeam } from "src/memberships/components/ContactListTeam"
import getProjectUsers from "src/users/queries/getProjectUsers"
import getProject from "src/projects/queries/getProject"
import { Tabs } from "src/core/components/Tabs/Tabs"

export const ProjectTeamWithQuery = () => {
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

      <ContactListTeam contacts={users} />
    </div>
  )
}

const ProjectTeamPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Projektteam" />

      <Suspense fallback={<Spinner page />}>
        <ProjectTeamWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

export default ProjectTeamPage
