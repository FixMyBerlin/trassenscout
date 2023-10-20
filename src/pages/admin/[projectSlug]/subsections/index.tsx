import { BlitzPage, Routes, useParam, useRouterQuery } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import router from "next/router"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Spinner } from "src/core/components/Spinner"
import { Link, blueButtonStyles } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { PageDescription } from "src/core/components/pages/PageDescription"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoTitleSlug, shortTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getProject from "src/projects/queries/getProject"
import { SubsectionTableAdmin } from "src/subsections/components/SubsectionTableAdmin"
import updateSubsectionsWithFeltData from "src/subsections/mutations/updateSubsectionsWithFeltData"
import getSubsections from "src/subsections/queries/getSubsections"

export const AdminSubsectionsWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })
  const [{ subsections }] = useQuery(getSubsections, { projectSlug: projectSlug! })
  const [updateSubsectionMutation] = useMutation(updateSubsectionsWithFeltData)

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
          <Link
            icon="plus"
            button="blue"
            href={Routes.AdminNewSubsectionsPage({ projectSlug: projectSlug! })}
          >
            Mehrere Planungsabschnitte erstellen
          </Link>
        </ButtonWrapper>
      </section>
    )
  }

  const handleFeltDataClick = async () => {
    try {
      const subsection = await updateSubsectionMutation({
        subsections,
        projectFeltUrl: project.felt_subsection_geometry_source_url,
      })
      await router.push(
        Routes.AdminSubsectionsPage({
          projectSlug: projectSlug!,
        }),
      )
    } catch (error: any) {
      return console.error(error)
    }
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
      <SubsectionTableAdmin subsections={filteredSubsections} />
      <Link
        icon="plus"
        button="blue"
        href={Routes.AdminNewSubsectionsPage({ projectSlug: projectSlug! })}
      >
        Mehrere Planungsabschnitte erstellen
      </Link>
      <button className={blueButtonStyles} onClick={handleFeltDataClick}>
        Daten von Felt übernehmen
      </button>

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
