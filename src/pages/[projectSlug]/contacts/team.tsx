import { BlitzPage, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { User } from "@prisma/client"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { ContactListTeam } from "src/memberships/components/ContactListTeam"
import getMembershipsSelectUser from "src/memberships/queries/getMembershipsSelectUser"
import getProject from "src/projects/queries/getProject"

const ITEMS_PER_PAGE = 100

export const ProjectTeamWithQuery = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const projectSlug = useParam("projectSlug", "string")

  const [project] = useQuery(getProject, { slug: projectSlug })

  const [membership] = useQuery(getMembershipsSelectUser, {
    slug: projectSlug!,
  })

  const teamContacts = membership.map((item: { user: User }) => item.user)

  return (
    <div className="mt-8 flex flex-col">
      <PageHeader
        title="Das Projektteam"
        description={`Dieser Bereich hilft Ihnen dabei wichtige Informationen und Kontakte der Beteiligten des Projektes ${project.title} zu finden.`}
      />
      <ContactListTeam contacts={teamContacts} />
    </div>
  )
}

const ProjectTeamPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")
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
