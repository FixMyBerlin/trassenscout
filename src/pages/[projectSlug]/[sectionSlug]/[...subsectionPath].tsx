import { BlitzPage, Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Position } from "@turf/helpers"
import { useRouter } from "next/router"
import { Suspense } from "react"

import {
  Subsection as SubsectionClient,
  Subsubsection as SubsubsectionClient,
} from "@prisma/client"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { ProjectMapSections } from "src/projects/components/Map"
import { SubsectionMap } from "src/projects/components/Map/SubsectionMap"
import { SubsubsectionSidebar } from "src/projects/components/Map/SubsubsectionSidebar"
import getSections from "src/sections/queries/getSections"
import { SubsubsectionTable } from "src/subsections/components/SubsubsectionTable"
import getSubsection from "src/subsections/queries/getSubsection"

export interface Subsubsection extends Omit<SubsubsectionClient, "geometry"> {
  geometry: Position[]
}

export interface Subsection extends Omit<SubsectionClient, "geometry"> {
  geometry: Position[]
  subsubsections: Subsubsection[]
}

export const SubsectionDashboardWithQuery = () => {
  const router = useRouter()
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  const [{ sections }] = useQuery(getSections, {
    where: { project: { slug: projectSlug! } },
    orderBy: { index: "asc" },
    include: { subsections: true },
  })
  const [subsectionOrg] = useQuery(getSubsection, {
    projectSlug: projectSlug!,
    sectionSlug: sectionSlug!,
    subsectionSlug: subsectionSlug!,
    includeSubsubsections: true,
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
      <PageHeader
        title={subsection!.title}
        action={
          <Link
            icon="edit"
            href={Routes.EditSubsectionPage({
              projectSlug: projectSlug!,
              sectionSlug: sectionSlug!,
              subsectionSlug: subsectionSlug!,
            })}
          >
            bearbeiten
          </Link>
        }
      />

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
        <SubsectionDashboardWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

SubsectionDashboardPage.authenticate = true

export default SubsectionDashboardPage
