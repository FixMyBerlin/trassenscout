import { useRouter } from "next/router"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Position } from "@turf/helpers"

import { useSlugs } from "src/core/hooks"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { SubsectionMap } from "src/projects/components/Map/SubsectionMap"
import getSections from "src/sections/queries/getSections"
import getSubsectionBySlugs from "src/subsections/queries/getSubsectionBySlugs"
import { ProjectMapSections } from "src/projects/components/Map"
import { SubsubsectionSidebar } from "src/projects/components/Map/SubsubsectionSidebar"
import {
  Subsection as SubsectionClient,
  Subsubsection as SubsubsectionClient,
} from "@prisma/client"
import { SubsubsectionTable } from "src/subsections/components/SubsubsectionTable"

export interface Subsubsection extends Omit<SubsubsectionClient, "geometry"> {
  geometry: Position[]
}

export interface Subsection extends Omit<SubsectionClient, "geometry"> {
  geometry: Position[]
  subsubsections: Subsubsection[]
}

export const SubsectionDashboard = () => {
  const router = useRouter()
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  const [subsectionOrg] = useQuery(getSubsectionBySlugs, {
    projectSlug: projectSlug!,
    sectionSlug: sectionSlug!,
    slug: subsectionSlug!,
    includeSubsubsections: true,
  })
  const [{ sections }] = useQuery(getSections, {
    where: { project: { slug: projectSlug! } },
    orderBy: { index: "asc" },
    include: { subsections: true },
  })

  const parseGeometry = (objectWithGeometry: Record<any, any> | { geometry: Position[] }) => {
    if (objectWithGeometry.geometry === null) return null
    try {
      return JSON.parse(objectWithGeometry.geometry)
    } catch (e: any) {
      console.error("Parsing :", e.message, JSON.parse(JSON.stringify(objectWithGeometry)))
      return null
    }
  }

  const subsection: Subsection = JSON.parse(JSON.stringify(subsectionOrg)) // deep copy
  subsection.geometry = parseGeometry(subsection)
  subsection.subsubsections.forEach((subsubsection) => {
    subsubsection.geometry = parseGeometry(subsubsection)
  })

  const subsubsection =
    subsubsectionSlug && subsection.subsubsections.find((s) => s.slug === subsubsectionSlug)

  return (
    <>
      <MetaTags noindex title={subsection!.title} />
      <PageHeader title={subsection!.title} />

      {/* Intro */}
      <div className="mb-12">
        {subsection.description && (
          <div className="mb-5">
            <Markdown markdown={subsection.description} />
          </div>
        )}
        <p>
          <strong>Teilstreckenlänge:</strong>{" "}
        </p>
      </div>

      <div className="relative mb-12 flex h-96 w-full gap-4 sm:h-[500px]">
        <SubsectionMap sections={sections as ProjectMapSections} selectedSection={subsection} />
        {subsubsection ? (
          <SubsubsectionSidebar
            className="absolute right-0 top-0 h-full w-1/3 overflow-auto border-2 border-black bg-white"
            subsubsection={subsubsection}
            onClose={() => {
              void router.push(
                Routes.SubsectionDashboardPage({
                  projectSlug: projectSlug!,
                  sectionSlug: sectionSlug!,
                  subsectionPath: [subsectionSlug!],
                }),
                undefined,
                { scroll: false }
              )
            }}
          ></SubsubsectionSidebar>
        ) : null}
      </div>

      {/* @ts-expect-errors the way we query for subsections causes the type to not know about subsections */}
      <SubsubsectionTable subsubsections={subsectionOrg.subsubsections} />

      {/* Admin Actions Section - noch ungestyled */}
      <section className="rounded border bg-blue-100 p-5">
        <Link
          href={Routes.EditSubsectionPage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
            subsectionSlug: subsectionSlug!,
          })}
        >
          {quote(subsection.title)} bearbeiten
        </Link>
        <br />

        <Link
          href={Routes.NewSubsubsectionPage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
            subsectionSlug: subsectionSlug!,
          })}
        >
          Neue Teilplanung
        </Link>
        <br />

        {/* Teilplanungen (Subsubsections bearbeiten) */}
        <ul>
          {subsection.subsubsections.map((subsubsection) => {
            return (
              <li key={subsubsection.id}>
                <Link
                  href={Routes.EditSubsubsectionPage({
                    projectSlug: projectSlug!,
                    sectionSlug: sectionSlug!,
                    subsectionSlug: subsectionSlug!,
                    subsubsectionSlug: subsubsectionSlug!,
                  })}
                >
                  {quote(subsubsection.title)} bearbeiten
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <SuperAdminLogData data={{ subsectionOrg, subsection, sections }} />
    </>
  )
}

const SubsectionDashboardPage: BlitzPage = () => {
  const { subsectionSlug } = useSlugs()
  if (subsectionSlug === undefined) return null

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <SubsectionDashboard />
      </Suspense>
    </LayoutRs>
  )
}

SubsectionDashboardPage.authenticate = true

export default SubsectionDashboardPage
