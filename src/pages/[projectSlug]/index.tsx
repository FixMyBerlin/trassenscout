import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import Image from "next/image"
import statusImg from "public/Planungsphase_Placeholder.jpg"
import { Suspense } from "react"
import { CalenderDashboard } from "src/calendar-entries/components"
import DashedLine from "src/core/components/DashedLine"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { H2 } from "src/core/components/text/Headings"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { ProjectMap } from "src/projects/components/Map/ProjectMap"
import type { ProjectMapSections } from "src/projects/components/Map/ProjectMap"
import { SectionsTeasers } from "src/projects/components/Map/SectionsTeaser/SectionsTeasers"
import getProject from "src/projects/queries/getProject"
import getSections from "src/sections/queries/getSections"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import getUser from "src/users/queries/getUser"
import { getFullname } from "src/users/utils"

export const ProjectDashboardWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const currentUser = useCurrentUser()
  const userName = getFullname(currentUser!)
  const [project] = useQuery(getProject, { slug: projectSlug })
  const [user] = useQuery(getUser, project.managerId)
  const [{ sections }] = useQuery(getSections, {
    where: { project: { slug: projectSlug! } },
    orderBy: { index: "asc" },
    include: { subsections: { select: { id: true, slug: true, geometry: true } } },
  })

  if (!sections.length)
    return (
      <>
        <section className="rounded border bg-blue-100 p-5">
          <Link href={Routes.EditProjectPage({ projectSlug: projectSlug! })}>
            {quote(project.title)} bearbeiten
          </Link>
          <br />
          <Link href={Routes.NewSectionPage({ projectSlug: projectSlug! })}>Neue Teilstrecke</Link>
        </section>
      </>
    )

  return (
    <>
      <MetaTags noindex title={project.title} />

      <PageHeader
        title={project.title}
        intro={`Willkommen im Trassenscout zum ${project.title}. Sie bekommen hier alle wichtigen Informationen zum aktuellen Stand der Planung. Unter Teilstrecken finden Sie die für Ihre Kommune wichtigen Informationen und anstehenden Aufgaben. `}
        logo
      />
      {/* TODO: intro prop evtl. mit project description ersetzen */}

      {/* Phasen Panel */}
      <H2 className="my-6">Aktuelle Planungsphase</H2>
      <div className="max-w-[650px]">
        <Image src={statusImg} alt=""></Image>
      </div>

      <DashedLine />

      {/* Karte mit Daten der Abschnitte/subsections und Teaser Teilstrecke/sections */}
      {/* {Boolean(sections && sections[0]?.subsections?.length) && ( */}
      <div className="mt-12">
        <ProjectMap sections={sections as ProjectMapSections} />
      </div>
      {/* )} */}
      {Boolean(sections.length) && <SectionsTeasers sections={sections} />}

      <CalenderDashboard />

      {/* Admin Actions Section - noch ungestyled */}
      <section className="rounded border bg-blue-100 p-5">
        <Link href={Routes.EditProjectPage({ projectSlug: projectSlug! })}>
          {quote(project.title)} bearbeiten
        </Link>
        <br />
        <Link href={Routes.NewSectionPage({ projectSlug: projectSlug! })}>Neue Teilstrecke</Link>
      </section>
    </>
  )
}

const ProjectDashboardPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <ProjectDashboardWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

export default ProjectDashboardPage
