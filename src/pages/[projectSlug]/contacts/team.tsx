import { BlitzPage, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { User } from "@prisma/client"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { ContactListTeam } from "src/contacts/components/ContactListTeam"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getProjectIncludeUsers from "src/projects/queries/getProjectIncludeUsers"
import getUser from "src/users/queries/getUser"

const ITEMS_PER_PAGE = 100

export const ProjectTeamWithQuery = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const projectSlug = useParam("projectSlug", "string")

  const [project] = useQuery(getProjectIncludeUsers, {
    slug: projectSlug!,
  })
  const [user] = useQuery(getUser, project.managerId)

  // @ts-ignore // TODO
  const { Membership } = project
  const teamContacts = Membership.map((item: { user: User }) => item.user)

  return (
    <div className="mt-8 flex flex-col">
      <PageHeader
        title="Das Projektteam"
        description={`Dieser Bereich hilft Ihnen dabei wichtige Informationen und Kontakte der Beteiligten des Projektes ${project.title} zu finden.`}
      />
      <ContactListTeam contacts={teamContacts} />
      <div className="mt-6"></div>
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
