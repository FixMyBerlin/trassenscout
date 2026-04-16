import { Link } from "@/src/core/components/links"
import { longTitle, shortTitle } from "@/src/core/components/text/titles"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import { subsubsectionLandAcquisitionRoute } from "@/src/core/routes/subsectionRoutes"
import { Route } from "next"

import { formatBerlinTime } from "@/src/core/utils/formatBerlinTime"

type Props = {
  projectSlug: string
  landAcquisitionModuleEnabled?: boolean
  subsection: { slug: string } | null
  subsubsection: { slug: string } | null
  acquisitionArea: {
    id: number
    subsubsection: {
      slug: string
      subsection: { slug: string }
    }
    parcel: { alkisParcelId: string }
  } | null
  projectRecords: { id: number; title: string; date: Date | null }[] | null
  projectRecordEmail: { createdAt: Date } | null
  surveyResponse: { id: number; surveySession: { survey: { slug: string } } } | null
  className?: string
}

export const UploadVerknuepfungen = ({
  projectSlug,
  landAcquisitionModuleEnabled = false,
  subsection,
  subsubsection,
  acquisitionArea,
  projectRecords,
  projectRecordEmail,
  surveyResponse,
  className,
}: Props) => {
  const hasSubsection = subsection !== null
  const hasSubsubsection = subsubsection !== null
  const hasProjectRecords = projectRecords != null && projectRecords.length > 0
  const hasAcquisitionArea = landAcquisitionModuleEnabled && acquisitionArea !== null
  const hasProjectRecordEmail = projectRecordEmail !== null
  const hasSurveyResponse = surveyResponse !== null
  const hasRelations =
    hasSubsection ||
    hasSubsubsection ||
    hasAcquisitionArea ||
    hasProjectRecords ||
    hasProjectRecordEmail ||
    hasSurveyResponse

  return (
    <section className={className}>
      <h4 className="text-sm font-medium">Verknüpfungen:</h4>
      {hasRelations ? (
        <ul className="mt-1.5 list-inside list-disc space-y-0.5 pl-4 text-sm">
          {hasSubsection && !hasSubsubsection && !hasAcquisitionArea && (
            <li>
              <strong className="font-medium">Planungsabschnitt: </strong>
              {shortTitle(subsection!.slug)} ({subsection!.slug})
            </li>
          )}
          {hasSubsubsection && !hasAcquisitionArea && (
            <li>
              <strong className="font-medium">Eintrag:</strong> {longTitle(subsubsection!.slug)}
            </li>
          )}
          {hasAcquisitionArea && (
            <li>
              <strong className="font-medium">Verhandlungsfläche:</strong>{" "}
              <Link
                href={
                  `${subsubsectionLandAcquisitionRoute(
                    projectSlug,
                    acquisitionArea!.subsubsection.subsection.slug,
                    acquisitionArea!.subsubsection.slug,
                  )}?acquisitionAreaId=${acquisitionArea!.id}` as Route
                }
              >
                {acquisitionArea!.id} ({acquisitionArea!.parcel.alkisParcelId})
              </Link>
            </li>
          )}
          {hasProjectRecords && (
            <li>
              <em className="font-medium">Protokolleinträge: </em>
              {projectRecords!.map((record, index) => (
                <span key={record.id}>
                  <Link href={projectRecordDetailRoute(projectSlug, record.id)}>
                    {record.title} {record.date && formatBerlinTime(record.date, "P")}
                  </Link>
                  {index < projectRecords!.length - 1 && ", "}
                </span>
              ))}
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
              <strong className="font-medium">E-Mail-Anhang:</strong>{" "}
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
