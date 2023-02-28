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

const ITEMS_PER_PAGE = 100

export const ProjectTeamWithQuery = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const projectSlug = useParam("projectSlug", "string")

  const [project] = useQuery(getProjectIncludeUsers, {
    slug: projectSlug!,
  })

  // @ts-ignore // TODO
  const { Membership } = project
  const teamContacts = Membership.map((item: { user: User }) => item.user)

  if (!teamContacts.length) {
    return (
      <p className="text-center text-xl text-gray-500">
        <span>Es wurden noch keine Kontakte eingetragen.</span>
      </p>
    )
  }

  return (
    <div className="mt-8 flex flex-col">
      <PageHeader
        title="Das Projektteam"
        description={`Dieser Bereich hilft Ihnen dabei wichtige Informationen und Kontakte der Beteiligten des Projektes ${project.title} zu finden.`}
      />
      <ContactListTeam contacts={teamContacts} />
      {/* TODO query memberships for project and replace contacts with users with membership */}
      <div className="mt-6"></div>
    </div>
  )
}

const ProjectTeamPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")
  return (
    <LayoutRs>
      <MetaTags noindex title="Kontakte" />

      <Suspense fallback={<Spinner page />}>
        <ProjectTeamWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

export default ProjectTeamPage
