import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import Image from "next/image"
import statusImg from "public/Planungsphase_Placeholder.jpg"
import { Suspense } from "react"
import { CalenderDashboard } from "src/calendar-entries/components"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "src/core/components/Breadcrumb/Breadcrumb"
import { ProjectMap } from "src/core/components/Map/ProjectMap"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { PageDescription } from "src/core/components/pages/PageDescription"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { quote, seoTitle } from "src/core/components/text"
import { H2 } from "src/core/components/text/Headings"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { SectionTable } from "src/projects/components/SectionTable"
import getProject from "src/projects/queries/getProject"
import getSectionsIncludeSubsections from "src/sections/queries/getSectionsIncludeSubsections"

export const ProjectDashboardWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })
  const [{ sections }] = useQuery(getSectionsIncludeSubsections, {
    where: { project: { slug: projectSlug! } },
  })

  if (!sections.length) {
    return (
      <>
        <section className="rounded border bg-blue-100 p-5">
          <Link href={Routes.EditProjectPage({ projectSlug: projectSlug! })}>
            {project.slug} bearbeiten
          </Link>
          <br />
          <Link href={Routes.NewSectionPage({ projectSlug: projectSlug! })}>Neue Teilstrecke</Link>
        </section>
      </>
    )
  }

  return (
    <>
      <MetaTags noindex title={seoTitle(project.slug)} />

      <Breadcrumb />
      <PageHeader
        title={project.slug}
        subtitle={project.subTitle}
        description={`Willkommen im Trassenscout zum ${project.slug}. Sie bekommen hier alle wichtigen Informationen zum aktuellen Stand der Planung. Unter Teilstrecken finden Sie die für Ihre Kommune wichtigen Informationen und anstehenden Aufgaben. `}
        action={
          <Link icon="edit" href={Routes.EditProjectPage({ projectSlug: projectSlug! })}>
            bearbeiten
          </Link>
        }
      />

      {project.description && (
        <PageDescription>
          <Markdown markdown={project.description} />
        </PageDescription>
      )}

      {/* Phasen Panel */}
      <section className="mt-12">
        <H2>Aktuelle Planungsphase</H2>
        <div className="mt-5 max-w-[650px]">
          <Image src={statusImg} alt=""></Image>
        </div>
      </section>

      <ProjectMap sections={sections} />

      <SectionTable sections={sections} />

      <CalenderDashboard />

      <SuperAdminLogData data={{ project, sections }} />
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
