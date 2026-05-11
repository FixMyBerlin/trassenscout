"use client"

import { Link } from "@/src/core/components/links"
import { shortTitle } from "@/src/core/components/text/titles"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import {
  subsectionDashboardRoute,
  subsubsectionDashboardRoute,
  subsubsectionLandAcquisitionRoute,
} from "@/src/core/routes/subsectionRoutes"
import { formatBerlinTime } from "@/src/core/utils/formatBerlinTime"
import { Route } from "next"

type AcquisitionAreaLink = {
  id: number
  subsubsection: {
    slug: string
    subsection: { slug: string }
  }
  parcel: { alkisParcelId: string }
}

type Props = {
  projectSlug: string
  asLinks?: boolean
  landAcquisitionModuleEnabled?: boolean
  subsection: { slug: string } | null
  subsubsections: { slug: string; subsection: { slug: string } }[]
  acquisitionAreas: AcquisitionAreaLink[]
  projectRecords: { id: number; title: string; date: Date | null }[] | null
  projectRecordEmail: { createdAt: Date } | null
  surveyResponse: { id: number; surveySession: { survey: { slug: string } } } | null
  className?: string
}

export const UploadVerknuepfungen = ({
  projectSlug,
  asLinks,
  landAcquisitionModuleEnabled,
  subsection,
  subsubsections,
  acquisitionAreas,
  projectRecords,
  projectRecordEmail,
  surveyResponse,
  className,
}: Props) => {
  const hasSubsection = subsection !== null
  const hasSubsubsection = subsubsections?.length > 0
  const hasProjectRecords = projectRecords != null && projectRecords.length > 0
  const hasAcquisitionAreas = landAcquisitionModuleEnabled && acquisitionAreas.length > 0
  const hasProjectRecordEmail = projectRecordEmail !== null
  const hasSurveyResponse = surveyResponse !== null
  const hasRelations =
    hasSubsection ||
    hasSubsubsection ||
    hasAcquisitionAreas ||
    hasProjectRecords ||
    hasProjectRecordEmail ||
    hasSurveyResponse

  const sortedAcquisitionAreas = hasAcquisitionAreas
    ? [...acquisitionAreas].sort((a, b) => {
        const subCompare = a.subsubsection.subsection.slug.localeCompare(
          b.subsubsection.subsection.slug,
        )
        if (subCompare !== 0) return subCompare
        const ssCompare = a.subsubsection.slug.localeCompare(b.subsubsection.slug)
        if (ssCompare !== 0) return ssCompare
        return a.id - b.id
      })
    : []

  return (
    <section className={className}>
      {hasRelations ? (
        <ul className="mt-1.5 list-none space-y-0.5 pl-4 text-sm">
          {hasSubsection && (
            <li>
              <strong className="font-medium">Planungsabschnitt: </strong>
              {asLinks ? (
                <Link href={subsectionDashboardRoute(projectSlug, subsection!.slug)}>
                  {shortTitle(subsection!.slug)}
                </Link>
              ) : (
                <>
                  {shortTitle(subsection!.slug)} ({subsection!.slug})
                </>
              )}
            </li>
          )}
          {hasSubsubsection &&
            (subsubsections.length === 1 ? (
              <li key={`${subsubsections[0]!.subsection.slug}-${subsubsections[0]!.slug}`}>
                <strong className="font-medium">Eintrag: </strong>
                {asLinks ? (
                  <Link
                    href={subsubsectionDashboardRoute(
                      projectSlug,
                      subsubsections[0]!.subsection.slug,
                      subsubsections[0]!.slug,
                    )}
                  >
                    {shortTitle(subsubsections[0]!.slug)}
                  </Link>
                ) : (
                  <strong className="font-medium">{shortTitle(subsubsections[0]!.slug)}</strong>
                )}
              </li>
            ) : (
              <li className="flex flex-wrap items-baseline gap-x-2">
                <strong className="font-medium">Einträge: </strong>
                <ul className="mt-0.5 flex list-none flex-wrap gap-x-2 pl-0">
                  {subsubsections.map((subsub) => (
                    <li key={`${subsub.subsection.slug}-${subsub.slug}`}>
                      {asLinks ? (
                        <Link
                          href={subsubsectionDashboardRoute(
                            projectSlug,
                            subsub.subsection.slug,
                            subsub.slug,
                          )}
                        >
                          {shortTitle(subsub.slug)}
                        </Link>
                      ) : (
                        shortTitle(subsub.slug)
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          {hasAcquisitionAreas &&
            (sortedAcquisitionAreas.length === 1 ? (
              <li key={sortedAcquisitionAreas[0]!.id}>
                <strong className="font-medium">Verhandlungsfläche: </strong>
                {asLinks ? (
                  <Link
                    href={
                      `${subsubsectionLandAcquisitionRoute(
                        projectSlug,
                        sortedAcquisitionAreas[0]!.subsubsection.subsection.slug,
                        sortedAcquisitionAreas[0]!.subsubsection.slug,
                      )}?acquisitionAreaId=${sortedAcquisitionAreas[0]!.id}` as Route
                    }
                  >
                    {sortedAcquisitionAreas[0]!.id} (
                    {sortedAcquisitionAreas[0]!.parcel.alkisParcelId})
                  </Link>
                ) : (
                  <>
                    {shortTitle(String(sortedAcquisitionAreas[0]!.id))} - Flurstücknr.{" "}
                    {sortedAcquisitionAreas[0]!.parcel.alkisParcelId}
                  </>
                )}
              </li>
            ) : (
              <li className="flex flex-wrap items-baseline gap-x-2">
                <strong className="font-medium">Verhandlungsflächen: </strong>
                <ul className="mt-0.5 flex list-none flex-wrap gap-x-2 pl-0">
                  {sortedAcquisitionAreas.map((area) => (
                    <li key={area.id}>
                      {asLinks ? (
                        <Link
                          href={
                            `${subsubsectionLandAcquisitionRoute(
                              projectSlug,
                              area.subsubsection.subsection.slug,
                              area.subsubsection.slug,
                            )}?acquisitionAreaId=${area.id}` as Route
                          }
                        >
                          {area.id} ({area.parcel.alkisParcelId})
                        </Link>
                      ) : (
                        <>
                          {shortTitle(String(area.id))} - Flurstücknr. {area.parcel.alkisParcelId}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          {hasProjectRecords && (
            <li>
              {projectRecords!.length === 1 ? (
                <>
                  <strong className="font-medium">Protokolleintrag: </strong>
                  <Link
                    href={projectRecordDetailRoute(projectSlug, projectRecords![0]!.id)}
                    scroll={false}
                  >
                    {projectRecords![0]!.title}
                    {projectRecords![0]!.date && (
                      <> {formatBerlinTime(projectRecords![0]!.date, "P")}</>
                    )}
                  </Link>
                </>
              ) : (
                <>
                  <strong className="font-medium">Protokolleinträge: </strong>
                  <ul className="mt-0.5 list-inside list-disc space-y-0.5 pl-2">
                    {projectRecords!.map((record) => (
                      <li key={record.id}>
                        <Link
                          href={projectRecordDetailRoute(projectSlug, record.id)}
                          scroll={false}
                        >
                          {record.title}
                          {record.date && <> {formatBerlinTime(record.date, "P")}</>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          )}
          {hasSurveyResponse && (
            <li>
              <strong className="font-medium">Beteiligung: </strong>
              Beitrag mit der ID {surveyResponse.id} - Formular{" "}
              {surveyResponse.surveySession.survey.slug}
            </li>
          )}
          {hasProjectRecordEmail && (
            <li>
              <strong className="font-medium">E-Mail-Anhang: </strong>
              {formatBerlinTime(projectRecordEmail!.createdAt, "dd.MM.yyyy, HH:mm")}
            </li>
          )}
        </ul>
      ) : (
        <p className="mt-1.5 text-sm">Dieses Dokument hat keine Verknüpfungen.</p>
      )}
    </section>
  )
}
