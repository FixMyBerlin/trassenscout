import { BlitzPage, Routes, useParam, useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { PageDescription } from "src/core/components/pages/PageDescription"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoTitleSlug, shortTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getProject from "src/projects/queries/getProject"
import { SubsectionTable } from "src/subsections/components/SubsectionTable"
import getSubsections from "src/subsections/queries/getSubsections"

export const AdminSubsectionsWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })
  const [{ subsections }] = useQuery(getSubsections, { projectSlug: projectSlug! })

  // We use the URL param `operator` to filter the UI
  // Docs: https://blitzjs.com/docs/route-params-query#use-router-query
  const params = useRouterQuery()
  const filteredSubsections = params.operator
    ? subsections.filter(
        (sec) => typeof params.operator === "string" && sec.operator?.slug === params.operator,
      )
    : subsections

  if (!subsections.length) {
    return (
      <section className="mt-12 p-5">
        <ButtonWrapper>
          <Link button="blue" href={Routes.AdminNewSubsectionPage({ projectSlug: projectSlug! })}>
            Neuer Planungsabschnitt
          </Link>
        </ButtonWrapper>
      </section>
    )
  }

  return (
    <>
      <MetaTags noindex title={seoTitleSlug(project.slug)} />

      <PageHeader
        title={shortTitle(project.slug)}
        subtitle={project.subTitle}
        description={`Planungsabschnitte ${project.subTitle}`}
      />

      {project.description && (
        <PageDescription>
          <Markdown markdown={project.description} />
        </PageDescription>
      )}
      <SubsectionTable subsections={filteredSubsections} />
      <Link
        icon="plus"
        button="blue"
        href={Routes.AdminNewSubsectionsPage({ projectSlug: projectSlug! })}
      >
        Mehrere Planungsabschnitte erstellen
      </Link>

      <SuperAdminLogData data={{ project, subsections, filteredSubsections }} />
    </>
  )
}

const AdminSubsectionsPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <AdminSubsectionsWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

export default AdminSubsectionsPage
