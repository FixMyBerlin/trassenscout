import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { CalenderDashboard } from "src/calendar-entries/components"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { BaseMapSections, SectionsMap } from "src/projects/components/Map"
import { SectionsTeasers } from "src/projects/components/Map/SectionsTeaser/SectionsTeasers"
import getProject from "src/projects/queries/getProject"
import getSections from "src/sections/queries/getSections"

export const ProjectDashboardWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })
  const [{ sections }] = useQuery(getSections, {
    where: { project: { slug: projectSlug! } },
    orderBy: { id: "asc" },
    include: { subsections: { select: { id: true, geometry: true } } },
  })

  if (!sections.length) return null

  return (
    <>
      <MetaTags noindex title={project.title} />
      <PageHeader title={project.title} />

      <h2>Alle Teilstrecken</h2>

      <SectionsMap sections={sections as BaseMapSections} />
      <SectionsTeasers sections={sections} />

      <CalenderDashboard />

      <section className="rounded border border-cyan-800 bg-cyan-100 p-5">
        <Link href={Routes.EditProjectPage({ projectSlug: projectSlug! })}>
          {quote(project.title)} bearbeiten
        </Link>

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
