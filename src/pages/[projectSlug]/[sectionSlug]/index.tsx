import { Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { PageHeader } from "src/core/components/PageHeader"
import { quote } from "src/core/components/text"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getSection from "src/sections/queries/getSection"
import StakeholdernoteList from "src/stakeholdernotes/components/StakeholdernoteList"
import getSubsections from "src/subsections/queries/getSubsections"

export const SectionDashboardWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const [section] = useQuery(getSection, { slug: sectionSlug })
  const [{ subsections, count }] = useQuery(getSubsections, {
    where: { section: { slug: sectionSlug! } },
    orderBy: { title: "asc" },
  })

  return (
    <>
      <MetaTags noindex title={section.title} />
      <PageHeader title={section.title} subtitle={section.subTitle} />

      <h2>Alle Daten zu unserer Teilstrecke</h2>
      <SuperAdminBox>
        <pre>{JSON.stringify(section, null, 2)}</pre>
      </SuperAdminBox>

      <h2>Alle {count} Abschnitte diese Teilstrecke</h2>
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

      <StakeholdernoteList />

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
        <Link
          href={Routes.NewStakeholdernotePage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
          })}
        >
          Neuer Stakeholder
        </Link>

        <ul>
          {subsections.map((subsection) => {
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

const SectionDashboardPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <SectionDashboardWithQuery />
      </Suspense>
    </LayoutArticle>
  )
}

SectionDashboardPage.authenticate = true

export default SectionDashboardPage
