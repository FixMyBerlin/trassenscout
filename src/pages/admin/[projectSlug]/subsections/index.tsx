import { BlitzPage, Routes, useParam, useRouterQuery } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Suspense, useState } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Spinner } from "src/core/components/Spinner"
import { Link, blueButtonStyles } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { PageDescription } from "src/core/components/pages/PageDescription"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { quote, seoTitleSlug, shortTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getProject from "src/projects/queries/getProject"
import { SubsectionTableAdmin } from "src/subsections/components/SubsectionTableAdmin"
import updateSubsectionsWithFeltData from "src/subsections/mutations/updateSubsectionsWithFeltData"
import getSubsections from "src/subsections/queries/getSubsections"
import getAdminStatus from "src/users/queries/getAdminStatus"

export const AdminSubsectionsWithQuery = () => {
  useQuery(getAdminStatus, {}) // See https://github.com/FixMyBerlin/private-issues/issues/936
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })
  const [{ subsections }, { refetch }] = useQuery(getSubsections, { projectSlug: projectSlug! })
  const [updateSubsectionMutation] = useMutation(updateSubsectionsWithFeltData)

  // We use the URL param `operator` to filter the UI
  // Docs: https://blitzjs.com/docs/route-params-query#use-router-query
  const params = useRouterQuery()
  const [error, setError]: any | null = useState(null)
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
    if (!project.felt_subsection_geometry_source_url) {
      window.alert("Keine Felt URL")
      return console.error("No Felt URL")
    } else {
      try {
        const subsection = await updateSubsectionMutation({
          subsections,
          projectFeltUrl: `${project.felt_subsection_geometry_source_url}.geojson`,
        })
        setError(null)
        await refetch()
      } catch (error: any) {
        setError(error)
        return console.error(error)
      }
    }
  }

  return (
    <>
      <MetaTags noindex title={seoTitleSlug(project.slug)} />

      <PageHeader
        className="mt-12"
        title={shortTitle(project.slug)}
        subtitle={project.subTitle}
        description={`Planungsabschnitte ${project.subTitle}`}
      />
      <SuperAdminBox>
        {project.description && (
          <PageDescription>
            <Markdown markdown={project.description} />
          </PageDescription>
        )}
        <SubsectionTableAdmin subsections={filteredSubsections} />
        {error && (
          <div role="alert" className="rounded bg-red-50 text-base px-2 py-1 text-red-800 mt-8">
            Es ist ein Fehler aufgetreten:
            <br />
            {quote(error.toString())}
            <br />
            Überprüfe die Felt-Url des Projekts.
          </div>
        )}
        <div className="mt-8 flex gap-5 sm:flex-row flex-col">
          <Link
            icon="plus"
            button="blue"
            href={Routes.AdminNewSubsectionsPage({ projectSlug: projectSlug! })}
          >
            Planungsabschnitte im Bulk-Mode hinzufügen
          </Link>
          {project.felt_subsection_geometry_source_url ? (
            <>
              <button className={blueButtonStyles} onClick={handleFeltDataClick}>
                Daten von Felt übernehmen
              </button>

              <Link button="blue" blank href={project.felt_subsection_geometry_source_url}>
                Geometrien in Felt bearbeiten
              </Link>
            </>
          ) : (
            <div className="flex flex-col justify-end">
              <Link href={Routes.EditProjectPage({ projectSlug: project.slug })}>
                Um die Geometrien der Planungsabschnitte in Felt zu bearbeiten, hier die Felt-Url
                für die Trasse angeben.
              </Link>
            </div>
          )}
        </div>
      </SuperAdminBox>
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
// See https://github.com/FixMyBerlin/private-issues/issues/936
// AdminSubsectionsPage.authenticate = { role: "ADMIN" }
AdminSubsectionsPage.authenticate = true

export default AdminSubsectionsPage
