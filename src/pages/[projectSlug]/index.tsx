import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { CalenderDashboard } from "src/calendar-entries/components"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "src/core/components/Breadcrumb/Breadcrumb"
import { ProjectMap } from "src/core/components/Map/ProjectMap"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { PageDescription } from "src/core/components/pages/PageDescription"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoTitleSlug, shortTitle } from "src/core/components/text"
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
        <section className="mt-12 p-5">
          <ButtonWrapper>
            <Link button="blue" href={Routes.NewSectionPage({ projectSlug: projectSlug! })}>
              Neue Teilstrecke
            </Link>
            <Link button="blue" href={Routes.EditProjectPage({ projectSlug: projectSlug! })}>
              {shortTitle(project.slug)} bearbeiten
            </Link>
          </ButtonWrapper>
        </section>
      </>
    )
  }

  return (
    <>
      <MetaTags noindex title={seoTitleSlug(project.slug)} />

      <Breadcrumb />
      <PageHeader
        title={shortTitle(project.slug)}
        subtitle={project.subTitle}
        description={`Willkommen im Trassenscout zum ${shortTitle(
          project.slug
        )}. Sie bekommen hier alle wichtigen Informationen zum aktuellen Stand der Planung. Unter Teilstrecken finden Sie die für Ihre Kommune wichtigen Informationen und anstehenden Aufgaben. `}
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
