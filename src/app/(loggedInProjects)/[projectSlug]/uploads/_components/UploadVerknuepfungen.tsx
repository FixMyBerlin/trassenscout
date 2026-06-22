"use client"

import { Link } from "@/src/core/components/links"
import { shortTitle } from "@/src/core/components/text/titles"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import {
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
  landAcquisitionModuleEnabled?: boolean
  subsubsections: { slug: string; subsection: { slug: string } }[]
  acquisitionAreas: AcquisitionAreaLink[]
  projectRecords: { id: number; title: string; date: Date | null }[] | null
  projectRecordEmail: { createdAt: Date } | null
  surveyResponse: { id: number; surveySession: { survey: { id: number; slug: string } } } | null
  className?: string
  variant?: "default" | "aligned"
}

export const UploadVerknuepfungen = ({
  projectSlug,
  landAcquisitionModuleEnabled,
  subsubsections,
  acquisitionAreas,
  projectRecords,
  projectRecordEmail,
  surveyResponse,
  className,
  variant = "default",
}: Props) => {
  const hasSubsubsection = subsubsections?.length > 0
  const hasProjectRecords = projectRecords != null && projectRecords.length > 0
  const hasAcquisitionAreas = landAcquisitionModuleEnabled && acquisitionAreas.length > 0
  const hasProjectRecordEmail = projectRecordEmail !== null
  const hasSurveyResponse = surveyResponse !== null
  const hasRelations =
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

  if (variant === "aligned") {
    const sectionClassName =
      "grid gap-2 sm:grid-cols-[minmax(170px,_190px)_1fr] sm:items-start sm:gap-x-1 sm:gap-y-4"
    const sectionLabelClassName = "text-sm font-medium text-gray-700"
    const sectionValueClassName = "text-sm text-gray-700"

    if (!hasRelations) {
      return <p className="text-sm text-gray-500">Keine Verknüpfung</p>
    }

    return (
      <section className={className}>
        {hasSubsubsection && (
          <div className={sectionClassName}>
            <p className={sectionLabelClassName}>Eintrag:</p>
            <div className={`space-y-1 ${sectionValueClassName}`}>
              {subsubsections.map((subsub) => (
                <Link
                  key={`${subsub.subsection.slug}-${subsub.slug}`}
                  href={subsubsectionDashboardRoute(
                    projectSlug,
                    subsub.subsection.slug,
                    subsub.slug,
                  )}
                  className="block w-fit"
                >
                  {shortTitle(subsub.slug)}
                </Link>
              ))}
            </div>
          </div>
        )}

        {hasAcquisitionAreas && (
          <div className={sectionClassName}>
            <p className={sectionLabelClassName}>
              {sortedAcquisitionAreas.length === 1 ? "Verhandlungsfläche:" : "Verhandlungsflächen:"}
            </p>
            <div className={`space-y-1 ${sectionValueClassName}`}>
              {sortedAcquisitionAreas.map((area) => (
                <Link
                  key={area.id}
                  href={
                    `${subsubsectionLandAcquisitionRoute(
                      projectSlug,
                      area.subsubsection.subsection.slug,
                      area.subsubsection.slug,
                    )}?acquisitionAreaId=${area.id}` as Route
                  }
                  className="block w-fit"
                >
                  {area.id} ({area.parcel.alkisParcelId})
                </Link>
              ))}
            </div>
          </div>
        )}

        {hasSurveyResponse && (
          <div className={sectionClassName}>
            <p className={sectionLabelClassName}>Beteiligung:</p>
            <div className={sectionValueClassName}>
              <Link
                href={`/${projectSlug}/surveys/${surveyResponse.surveySession.survey.id}/responses?responseDetails=${surveyResponse.id}`}
              >
                Eingabe mit der ID {surveyResponse.id} - Formular{" "}
                {surveyResponse.surveySession.survey.slug}
              </Link>
            </div>
          </div>
        )}

        {hasProjectRecordEmail && (
          <div className={sectionClassName}>
            <p className={sectionLabelClassName}>E-Mail-Anhang:</p>
            <span className={sectionValueClassName}>
              {formatBerlinTime(projectRecordEmail!.createdAt, "dd.MM.yyyy, HH:mm")}
            </span>
          </div>
        )}
      </section>
    )
  }

  return (
    <section className={className}>
      {hasRelations ? (
        <ul className="mt-1.5 list-none space-y-0.5 text-sm">
          {hasSubsubsection &&
            (subsubsections.length === 1 ? (
              <li key={`${subsubsections[0]!.subsection.slug}-${subsubsections[0]!.slug}`}>
                <strong className="font-medium">Maßnahme : </strong>
                <Link
                  href={subsubsectionDashboardRoute(
                    projectSlug,
                    subsubsections[0]!.subsection.slug,
                    subsubsections[0]!.slug,
                  )}
                >
                  {shortTitle(subsubsections[0]!.slug)}
                </Link>
              </li>
            ) : (
              <li className="flex flex-wrap items-baseline gap-x-2">
                <strong className="font-medium">Maßnahmen: </strong>
                <ul className="mt-0.5 flex list-none flex-wrap gap-x-2 pl-0">
                  {subsubsections.map((subsub) => (
                    <li key={`${subsub.subsection.slug}-${subsub.slug}`}>
                      <Link
                        href={subsubsectionDashboardRoute(
                          projectSlug,
                          subsub.subsection.slug,
                          subsub.slug,
                        )}
                      >
                        {shortTitle(subsub.slug)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          {hasAcquisitionAreas &&
            (sortedAcquisitionAreas.length === 1 ? (
              <li key={sortedAcquisitionAreas[0]!.id}>
                <strong className="font-medium">Verhandlungsfläche: </strong>
                <Link
                  href={
                    `${subsubsectionLandAcquisitionRoute(
                      projectSlug,
                      sortedAcquisitionAreas[0]!.subsubsection.subsection.slug,
                      sortedAcquisitionAreas[0]!.subsubsection.slug,
                    )}?acquisitionAreaId=${sortedAcquisitionAreas[0]!.id}` as Route
                  }
                >
                  {sortedAcquisitionAreas[0]!.id} ({sortedAcquisitionAreas[0]!.parcel.alkisParcelId}
                  )
                </Link>
              </li>
            ) : (
              <li className="flex flex-wrap items-baseline gap-x-2">
                <strong className="font-medium">Verhandlungsflächen: </strong>
                <ul className="mt-0.5 flex list-none flex-wrap gap-x-2 pl-0">
                  {sortedAcquisitionAreas.map((area) => (
                    <li key={area.id}>
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
              <Link
                href={`/${projectSlug}/surveys/${surveyResponse.surveySession.survey.id}/responses?responseDetails=${surveyResponse.id}`}
              >
                Eingabe mit der ID {surveyResponse.id} - Formular{" "}
                {surveyResponse.surveySession.survey.slug}
              </Link>
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
