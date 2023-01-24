import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { H2 } from "src/core/components/text/Headings"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FileTable } from "src/files/components/FileTable"
import getFiles from "src/files/queries/getFiles"
import { BaseMap, BaseMapSections, SectionsMap } from "src/projects/components/Map"
import getProject from "src/projects/queries/getProject"
import getSection from "src/sections/queries/getSection"
import getSections from "src/sections/queries/getSections"
import StakeholdernoteList from "src/stakeholdernotes/components/StakeholdernoteList"
import getStakeholdernotes from "src/stakeholdernotes/queries/getStakeholdernotes"
import getSubsections from "src/subsections/queries/getSubsections"

export const SectionDashboardWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })
  const [section] = useQuery(getSection, { sectionSlug, projectSlug }) // TODO projectId übergeben
  const [{ files }] = useQuery(getFiles, { where: { projectId: project.id } }) // TODO make project required
  const [{ stakeholdernotes }] = useQuery(getStakeholdernotes, {
    sectionId: section.id,
    orderBy: { id: "asc" },
  })
  const [{ subsections, count }] = useQuery(getSubsections, {
    where: { section: { slug: sectionSlug! } },
    orderBy: { title: "asc" },
  }) // TODO make project required
  const [{ sections }] = useQuery(getSections, {
    where: { project: { slug: projectSlug! } },
    orderBy: { id: "asc" },
    include: { subsections: { select: { id: true, geometry: true } } },
  }) // TODO make project required

  return (
    <>
      <MetaTags noindex title={section.title} />

      <PageHeader title={section.title} subtitle={section.subTitle} />

      <div className="mb-12">
        <p>
          <strong>Stakeholder:</strong> Todo Status Stakeholder
        </p>
        {section.description && (
          <p>
            <strong>Kurzinfo:</strong>
            <Markdown markdown={section.description} />
          </p>
        )}
      </div>

      <div className="mb-12 h-96 w-full sm:h-[500px]">
        <BaseMap
          sections={sections as BaseMapSections}
          selectedSection={section}
          isInteractive={false}
        />
      </div>
      {/*
      <SuperAdminBox>
        <pre>{JSON.stringify(section, null, 2)}</pre>
      </SuperAdminBox> */}

      <div className="mb-12">
        <H2 className="mb-5">Alle {count} Abschnitte dieser Teilstrecke</H2>
        <ul>
          {subsections.map((subsection) => {
            const debugSubsection = subsection
            debugSubsection.geometry = "Gekürzt für die Lesbarkeit"
            return (
              <li key={subsection.id}>
                <strong>{subsection.title}</strong>
                <Markdown markdown={subsection.description} />
                <pre>{JSON.stringify(subsection, undefined, 2)}</pre>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mb-12">
        <H2 className="mb-5 text-2xl font-bold">Wichtige Dateien</H2>
        <FileTable files={files} />
      </div>

      <div className="mb-12">
        <H2 className="mb-5 text-2xl font-bold">Stakeholderliste und Status der Abstimmung</H2>
        <StakeholdernoteList stakeholdernotes={stakeholdernotes} />
      </div>

      <section className="rounded border border-cyan-800 bg-cyan-100 p-5">
        <Link
          href={Routes.EditSectionPage({
            projectSlug: projectSlug!,
            sectionSlug: section.slug,
          })}
        >
          Bearbeiten (und löschen)
        </Link>
        <br />
        <Link
          href={Routes.NewSubsectionPage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })}
        >
          Neuer Abschnitt
        </Link>
        <br />
        {sectionSlug && (
          <Link
            href={Routes.NewStakeholdernotePage({
              projectSlug: projectSlug!,
              sectionSlug: sectionSlug!,
            })}
          >
            Neuer Stakeholder
          </Link>
        )}

        <ul>
          {subsections &&
            subsections.map((subsection) => {
              return (
                <li key={subsection.id}>
                  <Link
                    href={Routes.EditSubsectionPage({
                      projectSlug: projectSlug!,
                      sectionSlug: sectionSlug!,
                      subsectionSlug: subsection.slug,
                    })}
                  >
                    {quote(subsection.title)} bearbeiten
                  </Link>
                </li>
              )
            })}
        </ul>
      </section>
    </>
  )
}

const SectionDashboardPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <SectionDashboardWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

SectionDashboardPage.authenticate = true

export default SectionDashboardPage
