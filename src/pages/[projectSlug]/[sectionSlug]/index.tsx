import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { proseClasses, quote } from "src/core/components/text"
import { H2 } from "src/core/components/text/Headings"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FileTable } from "src/files/components/FileTable"
import getFiles from "src/files/queries/getFiles"
import { SectionsMap } from "src/projects/components/Map"
import type { BaseMapSections } from "src/projects/components/Map/BaseMapView"
import getSection from "src/sections/queries/getSection"
import getSections from "src/sections/queries/getSections"
import StakeholdernoteList from "src/stakeholdernotes/components/StakeholdernoteList"
import { StakeholderSectionStatus } from "src/stakeholdernotes/components/StakeholderSectionStatus"
import getStakeholdernotes from "src/stakeholdernotes/queries/getStakeholdernotes"
import getSubsections from "src/subsections/queries/getSubsections"
import getUser from "src/users/queries/getUser"

export const SectionDashboardWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const [section] = useQuery(getSection, { sectionSlug, projectSlug }) // TODO optimize to allow projectId as well to get rid of one query in case we can
  const [user] = useQuery(getUser, section.managerId)
  const [{ files }] = useQuery(getFiles, { projectSlug: projectSlug! })
  const [{ stakeholdernotes }] = useQuery(getStakeholdernotes, {
    sectionSlug: sectionSlug!,
    orderBy: { id: "asc" },
  })
  const [{ subsections, count }] = useQuery(getSubsections, {
    where: { sectionId: section.id },
    orderBy: { title: "asc" },
  }) // TODO make project required
  const [{ sections }] = useQuery(getSections, {
    where: { project: { slug: projectSlug! } },
    orderBy: { index: "asc" },
    include: { subsections: { select: { id: true, geometry: true } } },
  }) // TODO make project required

  const sectionsWithSubsections = sections as BaseMapSections
  const selectedSectionWithSubsections = sectionsWithSubsections.find((s) => s.id === section.id)

  return (
    <>
      <MetaTags noindex title={section.title} />

      <PageHeader title={section.title} subtitle={section.subTitle} />

      {/* Intro: Kurzinfo, Stakeholderstatus, Teilstreckenl??nge */}
      <div className="mb-12">
        {section.description && (
          <div className="mb-5">
            <Markdown markdown={section.description} />
          </div>
        )}
        <StakeholderSectionStatus stakeholdernotes={stakeholdernotes} />
        <p>
          <strong>Teilstreckenl??nge:</strong> {section.length ? section.length + " km" : " k.A."}
        </p>
      </div>

      {/* Karte mit Daten der subsections */}
      {Boolean(subsections.length) && (
        <div className="mb-12 flex h-96 w-full gap-4 sm:h-[500px]">
          <SectionsMap
            sections={sectionsWithSubsections}
            selectedSection={selectedSectionWithSubsections}
            isInteractive={false}
          />
          {/* <SectionPanel section={section} /> */}
        </div>
      )}

      {/* Dateien / files */}
      {Boolean(files.length) && (
        <div className="mb-12">
          <H2 className="mb-5 text-2xl font-bold">Relevante Dokumente</H2>
          <FileTable files={files} />
        </div>
      )}

      {/* Stakeholder / stakeholdernotes */}
      {Boolean(stakeholdernotes.length) && (
        <div className="mb-12">
          <H2 className="mb-5 text-2xl font-bold">
            Abstimmung mit <abbr title="Tr??ger ??ffentlicher Belange">T??B</abbr>s
          </H2>
          <StakeholdernoteList stakeholdernotes={stakeholdernotes} />
          <Link
            href={Routes.NewStakeholdernotePage({
              projectSlug: projectSlug!,
              sectionSlug: sectionSlug!,
            })}
            button
          >
            Neuer T??B
          </Link>
        </div>
      )}

      {/* Admin Actions Section - noch ungestyled */}
      <section className="rounded border bg-blue-100 p-5">
        <Link
          href={Routes.EditSectionPage({
            projectSlug: projectSlug!,
            sectionSlug: section.slug,
          })}
        >
          Bearbeiten
        </Link>
        <br />
        <Link
          href={Routes.NewSubsectionPage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })}
        >
          Neuer Abschnitt
        </Link>
        <br />
        {sectionSlug && (
          <>
            <Link
              href={Routes.NewStakeholdernotePage({
                projectSlug: projectSlug!,
                sectionSlug: sectionSlug!,
              })}
            >
              Neuer T??B
            </Link>
            <br />
            <Link
              href={Routes.NewStakeholdernoteMultiPage({
                projectSlug: projectSlug!,
                sectionSlug: sectionSlug!,
              })}
            >
              Mehrere neue T??Bs erstellen
            </Link>
          </>
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

      <SuperAdminBox>
        <div className="mb-12 space-y-6">
          <div className={proseClasses}>
            <pre>{JSON.stringify({ section }, null, 2)}</pre>
          </div>
          <H2 className="mb-5">Alle {count} Abschnitte dieser Teilstrecke</H2>
          <ul>
            {subsections.map((subsection) => {
              const debugSubsection = subsection
              debugSubsection.geometry = "Gek??rzt f??r die Lesbarkeit"
              return (
                <li key={subsection.id}>
                  <strong>{subsection.title}</strong>
                  <Markdown markdown={subsection.description} />
                  <div className={proseClasses}>
                    <pre>{JSON.stringify({ subsection }, undefined, 2)}</pre>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </SuperAdminBox>
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
