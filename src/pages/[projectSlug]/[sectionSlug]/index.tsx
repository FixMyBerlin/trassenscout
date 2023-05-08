import { BlitzPage, Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { H2 } from "src/core/components/text/Headings"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FileTable } from "src/files/components/FileTable"
import getFiles from "src/files/queries/getFiles"
import type { ProjectMapSections } from "src/projects/components/Map/ProjectMap"
import { SectionMap } from "src/projects/components/Map/SectionMap"
import { SubsectionTable } from "src/sections/components/SubsectionTable"
import getSection from "src/sections/queries/getSection"
import getSections from "src/sections/queries/getSections"
import { StakeholderSectionStatus } from "src/stakeholdernotes/components/StakeholderSectionStatus"
import StakeholdernoteList from "src/stakeholdernotes/components/StakeholdernoteList"
import getStakeholdernotes from "src/stakeholdernotes/queries/getStakeholdernotes"
import getSubsections from "src/subsections/queries/getSubsections"

export const SectionDashboardWithQuery = () => {
  const { projectSlug, sectionSlug } = useSlugs()

  const [section] = useQuery(getSection, { projectSlug: projectSlug!, sectionSlug: sectionSlug! })
  const [{ files }] = useQuery(getFiles, { projectSlug: projectSlug! })
  const [{ stakeholdernotes }] = useQuery(getStakeholdernotes, {
    sectionSlug: sectionSlug!,
    orderBy: { id: "asc" },
  })
  // TODO: Having both those calls is weird; Ideally change the getSectionS to getSection "include subsections".
  const [{ sections }] = useQuery(getSections, {
    where: { project: { slug: projectSlug! } },
    orderBy: { index: "asc" },
    include: { subsections: true },
  }) // TODO make project required
  const [{ subsections }] = useQuery(getSubsections, {
    where: { sectionId: section.id },
    orderBy: { title: "asc" },
  }) // TODO make project required

  const sectionsWithSubsections = sections as ProjectMapSections
  const selectedSectionWithSubsections = sectionsWithSubsections.find((s) => s.id === section.id)

  return (
    <>
      <MetaTags noindex title={section.title} />

      <PageHeader
        title={section.title}
        subtitle={section.subTitle}
        action={
          <Link
            icon="edit"
            href={Routes.EditSectionPage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })}
          >
            bearbeiten
          </Link>
        }
      />

      {/* Intro: Kurzinfo, Stakeholderstatus, Teilstreckenlänge */}
      <section className="mb-12">
        {section.description && (
          <div className="mb-5">
            <Markdown markdown={section.description} />
          </div>
        )}
        <StakeholderSectionStatus stakeholdernotes={stakeholdernotes} />
        <p>
          <strong>Teilstreckenlänge:</strong> {section.length ? section.length + " km" : " k.A."}
        </p>
      </section>

      {/* Karte mit Daten der subsections */}
      {Boolean(subsections.length) && (
        <section className="mb-12 flex h-96 w-full gap-4 sm:h-[500px]">
          <SectionMap
            sections={sectionsWithSubsections}
            // @ts-ignore
            selectedSection={selectedSectionWithSubsections}
          />
          {/* <SectionPanel section={section} /> */}
        </section>
      )}

      <SubsectionTable subsections={subsections} />

      {/* Dateien / files */}
      {Boolean(files.length) && (
        <section className="mb-12">
          <H2 className="mb-5 text-2xl font-bold">Relevante Dokumente</H2>
          <FileTable files={files} />
        </section>
      )}

      {/* Stakeholder / stakeholdernotes */}
      {Boolean(stakeholdernotes.length) && (
        <section className="mb-12">
          <H2 className="mb-5 text-2xl font-bold">
            Abstimmung mit <abbr title="Träger öffentlicher Belange">TöB</abbr>s
          </H2>
          <StakeholdernoteList stakeholdernotes={stakeholdernotes} />
          <ButtonWrapper>
            <Link
              button="blue"
              icon="plus"
              href={Routes.NewStakeholdernotePage({
                projectSlug: projectSlug!,
                sectionSlug: sectionSlug!,
              })}
            >
              TöB
            </Link>
            <Link
              button="white"
              icon="plus"
              href={Routes.NewStakeholdernoteMultiPage({
                projectSlug: projectSlug!,
                sectionSlug: sectionSlug!,
              })}
            >
              Mehrere TöBs
            </Link>
          </ButtonWrapper>
        </section>
      )}

      <SuperAdminLogData data={{ sections, subsections, stakeholdernotes }} />
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
